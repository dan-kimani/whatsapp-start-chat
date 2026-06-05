import { useEffect } from "react";
import { router } from "expo-router";
import { createBroadcast } from "../../db";

export default function NewBroadcast() {
  useEffect(() => {
    const id = createBroadcast("");
    router.replace(`/broadcast/${id}`);
  }, []);

  return null;
}
