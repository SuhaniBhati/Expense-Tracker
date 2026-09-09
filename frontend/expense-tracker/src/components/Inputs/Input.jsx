import React, { useState } from "react";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";

const Input = ({ value, onChange, label, placeholder, type }) => {
  const [showPassword, setShowPassword] = useState(false);

  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="w-full">
      {/* Label */}
      <label className="text-[13px] font-medium text-ink-muted">
        {label}
      </label>

      {/* Input Wrapper */}
      <div className="et-input">
        <input
          type={
            type === "password"
              ? showPassword
                ? "text"
                : "password"
              : type
          }
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e)}
          className="
            w-full
            bg-transparent
            outline-none
            border-none
            text-ink
            placeholder:text-ink-faint
            appearance-none
          "
          style={{
            /*
             * Chrome applies its own background to autofilled inputs.
             * This inset shadow forces the autofill area to use the
             * application's existing input theme color instead.
             */
            WebkitBoxShadow:
              "0 0 0 1000px var(--color-input) inset",

            /*
             * Make sure Chrome's autofilled text also follows
             * the application's light/dark theme.
             */
            WebkitTextFillColor: "var(--color-ink)",

            /*
             * Keep the cursor consistent with the current theme.
             */
            caretColor: "var(--color-ink)",
          }}
        />

        {/* Password Visibility Toggle */}
        {type === "password" && (
          <button
            type="button"
            onClick={toggleShowPassword}
            className="
              flex
              items-center
              justify-center
              shrink-0
              text-ink-faint
              hover:text-primary
              transition-colors
              duration-200
              cursor-pointer
              focus:outline-none
            "
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <FaRegEye size={20} />
            ) : (
              <FaRegEyeSlash size={20} />
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default Input;