import React from "react";
import { getInitials } from "../../utils/helper";

const CharAvatar = ({ fullName, width = "w-12", height = "h-12", style = "text-base" }) => {
  return (
    <div
      className={`${width} ${height} flex items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-700 text-white font-semibold ${style} select-none flex-shrink-0`}
    >
      {getInitials(fullName)}
    </div>
  );
};

export default CharAvatar;
