"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const IndexPage = (): JSX.Element => {
  const router = useRouter();

  useEffect(() => {
    router.replace("/applications");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <p className="text-slate-600">Redirecting...</p>
      </div>
    </div>
  );
};

export default IndexPage;

