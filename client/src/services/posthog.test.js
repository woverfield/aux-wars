import { describe, expect, it, vi } from "vitest";
import { syncPostHogConsent } from "./posthog";

function makeClient(optedOut = false) {
  return {
    has_opted_out_capturing: vi.fn(() => optedOut),
    opt_in_capturing: vi.fn(),
    opt_out_capturing: vi.fn(),
  };
}

describe("syncPostHogConsent", () => {
  it.each([null, "accepted"])("does nothing when capture is already on (%s)", (consent) => {
    const client = makeClient(false);

    syncPostHogConsent(client, consent);

    expect(client.opt_in_capturing).not.toHaveBeenCalled();
    expect(client.opt_out_capturing).not.toHaveBeenCalled();
  });

  it("opts out only on the transition to rejected", () => {
    const capturing = makeClient(false);
    const alreadyOut = makeClient(true);

    syncPostHogConsent(capturing, "rejected");
    syncPostHogConsent(alreadyOut, "rejected");

    expect(capturing.opt_out_capturing).toHaveBeenCalledOnce();
    expect(alreadyOut.opt_out_capturing).not.toHaveBeenCalled();
  });

  it.each([null, "accepted"])("silently resumes after rejection (%s)", (consent) => {
    const client = makeClient(true);

    syncPostHogConsent(client, consent);

    expect(client.opt_in_capturing).toHaveBeenCalledWith({ captureEventName: false });
    expect(client.opt_out_capturing).not.toHaveBeenCalled();
  });
});
