"use client";

import { useParams } from "next/navigation";
import PublicationAdminForm from "@/components/PublicationAdminForm";

const EditPublicationPage = () => {
  const params = useParams();
  const id = params?.id as string;

  return <PublicationAdminForm mode="edit" id={id} />;
};

export default EditPublicationPage;
