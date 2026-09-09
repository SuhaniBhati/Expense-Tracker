import React from "react";
import { getInitials } from "../../utils/helper";

const CharAvatar = ({
  fullName,
  width = "w-12",
  height = "h-12",
  style = "text-base",
}) => {
  return (
    <div
      className={`${width} ${height} flex shrink-0 select-none items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-hover font-semibold text-white shadow-[var(--shadow-button)] ${style}`}
      aria-label={fullName || "User avatar"}
    >
      {getInitials(fullName)}
    </div>
  );
};

export default CharAvatar;
