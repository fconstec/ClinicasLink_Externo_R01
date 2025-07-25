export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as any).message === "string"
  ) {
    return (error as any).message;
  }
  return String(error);
}

export function getClinicId(): string {
  const id = localStorage.getItem("clinic_id");
  if (!id) throw new Error("clinic_id não encontrado no localStorage.");
  return id;
}