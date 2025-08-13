import { useState, useEffect, useRef, useCallback } from "react";
import { API_BASE_URL } from "@/api/apiBase";
import type { PatientSearchResult } from "./types";

interface UsePatientSearchOptions {
  /**
   * Número mínimo de caracteres antes de disparar a busca.
   * Default: 2
   */
  minChars?: number;
  /**
   * Debounce em ms entre digitação e requisição.
   * Default: 300
   */
  debounceMs?: number;
  /**
   * Se true, dropdown aparece mesmo sem resultados (útil para "Nenhum encontrado").
   * Default: false
   */
  showDropdownWhenEmpty?: boolean;
  /**
   * Transformação opcional dos resultados antes de salvar no estado.
   */
  transform?: (results: PatientSearchResult[]) => PatientSearchResult[];
}

/**
 * Cache em memória por chave: clinicId + termo normalizado
 */
const memoryCache = new Map<string, PatientSearchResult[]>();

/**
 * Normaliza nome/termo para chave de cache.
 */
function normalizeTerm(term: string) {
  return term.trim().toLowerCase();
}

function buildUrl(base: string, clinicId: string | number | undefined, q: string) {
  const url = new URL(base);
  if (clinicId != null && clinicId !== "") {
    url.searchParams.set("clinicId", String(clinicId));
  }
  // Mantemos 'search' e 'q' por compatibilidade (se backend aceita ambos)
  url.searchParams.set("search", q);
  url.searchParams.set("q", q);
  return url.toString();
}

/**
 * Tenta mapear um item cru para PatientSearchResult seguro.
 */
function mapItem(raw: any): PatientSearchResult | null {
  if (!raw) return null;
  const id = Number(raw.id);
  if (!id || isNaN(id)) return null;
  const name = String(raw.name ?? raw.fullName ?? raw.patientName ?? "").trim();
  if (!name) return null;
  return {
    id,
    name,
    birthDate: raw.birthDate || raw.birth_date || undefined,
    phone: raw.phone || raw.telefone || undefined,
    email: raw.email || undefined,
  };
}

export function usePatientSearch(
  search: string,
  clinicId: number | string | undefined,
  patientId?: number,
  options?: UsePatientSearchOptions
) {
  const {
    minChars = 2,
    debounceMs = 300,
    showDropdownWhenEmpty = false,
    transform,
  } = options || {};

  const [patientOptions, setPatientOptions] = useState<PatientSearchResult[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Guarda último termo buscado para não refazer a mesma requisição
  const lastTermRef = useRef<string>("");
  const activeRequestRef = useRef<number>(0);

  const effectiveClinicId = clinicId ?? localStorage.getItem("clinic_id") ?? "";

  const runFetch = useCallback(
    async (termRaw: string) => {
      const term = normalizeTerm(termRaw);
      if (term.length < minChars) {
        setPatientOptions([]);
        setShowPatientDropdown(false);
        setError(null);
        return;
      }
      if (patientId) {
        // Se paciente já selecionado, não busca
        setPatientOptions([]);
        setShowPatientDropdown(false);
        setError(null);
        return;
      }

      // Cache
      const cacheKey = `${effectiveClinicId}::${term}`;
      if (memoryCache.has(cacheKey)) {
        const cached = memoryCache.get(cacheKey)!;
        setPatientOptions(cached);
        setShowPatientDropdown(
          showDropdownWhenEmpty ? true : cached.length > 0
        );
        setError(null);
        return;
      }

      setLoadingPatients(true);
      setError(null);
      setShowPatientDropdown(true);
      const requestId = ++activeRequestRef.current;
      const controller = new AbortController();

      try {
        const primary = buildUrl(`${API_BASE_URL}/patients`, effectiveClinicId, term);
        const fallback = buildUrl(`${API_BASE_URL}/api/patients`, effectiveClinicId, term);

        // Primeira tentativa
        let res = await fetch(primary, { signal: controller.signal });
        if (res.status === 404) {
            res = await fetch(fallback, { signal: controller.signal });
        }
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const json = await res.json();
        const list = Array.isArray(json) ? json : [];

        const mapped = list
          .map(mapItem)
          .filter((x): x is PatientSearchResult => !!x);

        // Remover duplicados por id
        const uniqueMap = new Map<number, PatientSearchResult>();
        for (const item of mapped) {
          if (!uniqueMap.has(item.id)) uniqueMap.set(item.id, item);
        }
        let finalArr = Array.from(uniqueMap.values()).sort((a, b) =>
          a.name.localeCompare(b.name, "pt-BR", { sensitivity: "base" })
        );

        if (transform) {
          finalArr = transform(finalArr);
        }

        memoryCache.set(cacheKey, finalArr);

        // Evita race condition: só aplica se este ainda é o request ativo
        if (requestId === activeRequestRef.current) {
          setPatientOptions(finalArr);
          setShowPatientDropdown(
            showDropdownWhenEmpty ? true : finalArr.length > 0
          );
          setError(null);
        }
      } catch (e: any) {
        if (e?.name === "AbortError") return;
        if (requestId === activeRequestRef.current) {
          setPatientOptions([]);
          setShowPatientDropdown(false);
          setError(e?.message || "Erro ao buscar pacientes");
        }
      } finally {
        if (requestId === activeRequestRef.current) {
          setLoadingPatients(false);
        }
      }

      return () => {
        controller.abort();
      };
    },
    [
      effectiveClinicId,
      minChars,
      patientId,
      showDropdownWhenEmpty,
      transform,
    ]
  );

  // Debounce effect
  useEffect(() => {
    const termNorm = normalizeTerm(search || "");
    if (termNorm === lastTermRef.current) return; // não refazer
    lastTermRef.current = termNorm;

    let timer: ReturnType<typeof setTimeout> | undefined;
    timer = setTimeout(() => {
      runFetch(termNorm);
    }, debounceMs);

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [search, debounceMs, runFetch]);

  // Expor função manual para refetch (ex: ao clicar em "tentar novamente")
  const refetch = useCallback(
    (overrideTerm?: string) => {
      const newTerm = normalizeTerm(
        overrideTerm != null ? overrideTerm : search
      );
      lastTermRef.current = ""; // força nova busca
      runFetch(newTerm);
    },
    [runFetch, search]
  );

  return {
    patientOptions,
    loadingPatients,
    showPatientDropdown,
    setShowPatientDropdown,
    error,
    hasResults: patientOptions.length > 0,
    refetch,
  };
}