import "./Logo.css";

/**
 * Animated Pocket AI logo.
 * size: pixel size of the circular mark
 * withText: show "Pocket AI" wordmark next to the mark
 */
export default function Logo({ size = 42, withText = true, subtitle }) {
  return (
    <div className="pai-logo" style={{ "--logo-size": `${size}px` }}>
      <div className="pai-logo-mark">
        <span className="pai-logo-ring" />
        <span className="pai-logo-core" />
      </div>
      {withText && (
        <div className="pai-logo-text">
          <h2 className="pocket-text">
            Pocket <span>AI</span>
          </h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
      )}
    </div>
  );
}
