import React from "react";
import AppointmentsManager from "@/components/ClinicAdminPanel_Managers/AppointmentsManager";
import type { Professional, Service } from "@/components/ClinicAdminPanel_Managers/types";

interface AppointmentsTabProps {
  professionals: Professional[];
  services: Service[];
}

const AppointmentsTab: React.FC<AppointmentsTabProps> = ({
  professionals,
  services,
}) => {
  return (
    <AppointmentsManager
      professionals={professionals || []}
      services={services || []}
    />
  );
};

export default React.memo(AppointmentsTab);