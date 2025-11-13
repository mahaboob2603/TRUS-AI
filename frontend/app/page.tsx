"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const IndexPage = (): null => {
  const router = useRouter();

  useEffect(() => {
    router.replace("/applications");
  }, [router]);

  return null;
};

export default IndexPage;

