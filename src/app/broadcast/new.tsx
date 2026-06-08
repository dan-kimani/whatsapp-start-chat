import { router } from "expo-router";
import { useEffect } from "react";

import { createBroadcast } from "../../db";

export default function NewBroadcast() {
  useEffect(() => {
    const id = createBroadcast("");
    router.replace(`/broadcast/${id}`);
  }, []);

  return null;
}
