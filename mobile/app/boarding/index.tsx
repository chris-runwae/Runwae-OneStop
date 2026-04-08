import { useRouter } from "expo-router";
import { useEffect } from "react";

const BoardingIndex = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to step-1 when accessing boarding index
    router.replace("/boarding/step-1");
  }, [router]);

  return null;
};

export default BoardingIndex;
