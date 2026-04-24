import { Suspense } from "react";
import VerifyAccount from "./verify-account";

export default function Page() {
  return (
    <Suspense>
      <VerifyAccount />
    </Suspense>
  );
}
