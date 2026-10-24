import { useState } from "react";
import "./ack.css";
import { power } from "../../helper/powerApi";

export default function Ack({
  isPowerOperation,
  setInformer,
  setIsPowerOperation,
}) {
  const [executing, setExecuting] = useState(false);

  const executePowerOperation = async () => {
    if (executing || !isPowerOperation) return;

    setExecuting(true);

    try {
      const response = await power(isPowerOperation);

      setInformer({
        msg:
          response?.message ||
          `${isPowerOperation} command executed successfully.`,
        state: true,
      });

      setIsPowerOperation("");
    } catch (error) {
      console.error("Power operation error:", error);

      setInformer({
        msg: error.message || "Power operation failed.",
        state: true,
      });

      setIsPowerOperation("");
    } finally {
      setExecuting(false);
    }
  };

  const cancelPowerOperation = () => {
    if (executing) return;

    setIsPowerOperation("");
  };

  return (
    <div className="ack-overlay">
      <div
        className="alert"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="ack-message"
      >
        <div className="msg">
          <span id="ack-message">
            Are you sure you want to{" "}
            <strong>{isPowerOperation}</strong> your machine?
          </span>

          <div className="btn-container">
            <button
              type="button"
              className="yes"
              onClick={executePowerOperation}
              disabled={executing}
            >
              {executing ? "Executing..." : "Yes"}
            </button>

            <button
              type="button"
              className="no"
              onClick={cancelPowerOperation}
              disabled={executing}
            >
              No
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}