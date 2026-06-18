const backendURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

const pollJudge0 = async (submissionId) => {
  let attempts = 0;
  const maxAttempts = 20;
  const delay = (ms) => new Promise((res) => setTimeout(res, ms));

  while (attempts < maxAttempts) {
    const res = await fetch(
      `${backendURL}/api/Submission/submit/poll/${encodeURIComponent(submissionId)}`,
      {
        method: "GET",
        credentials: "include",
      },
    );

    const data = await res.json();
    if (!res.ok || data?.ok === false) {
      throw new Error(data?.message || "Failed to poll submission");
    }

    // THE FIX: Only return the data if it has completely finished
    if (
      data.status !== "pending" &&
      data.status !== "queued" &&
      data.status !== "processing"
    ) {
      return data;
    }

    await delay(3000);
    attempts++;
  }

  throw new Error("Submission timed out. Try again.");
};

const pollRun = async (runId) => {
  let attempts = 0;
  const maxAttempts = 10;
  const delay = (ms) => new Promise((res) => setTimeout(res, ms));

  while (attempts < maxAttempts) {
    const res = await fetch(
      `${backendURL}/api/Submission/run/poll/${encodeURIComponent(runId)}`,
      {
        method: "GET",
        credentials: "include",
      },
    );

    const data = await res.json();
    if (!res.ok || data?.ok === false) {
      throw new Error(data?.message || "Failed to poll run");
    }

    // THE FIX: Recognize all intermediate backend states
    if (
      data.status !== "pending" &&
      data.status !== "queued" &&
      data.status !== "processing"
    ) {
      return data;
    }

    await delay(1500);
    attempts++;
  }

  throw new Error("Run timed out. Try again.");
};

export { pollJudge0, pollRun };
