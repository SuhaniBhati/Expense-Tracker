import React, {
  useContext,
  useState,
} from "react";

import { SIDE_MENU_DATA } from "../../utils/data";

import { UserContext } from "../../context/userContext";

import { useNavigate } from "react-router-dom";

import CharAvatar from "../Cards/CharAvatar";

import { LuPencilLine } from "react-icons/lu";

import EditProfileModal from "../Profile/EditProfileModal";

const SideMenu = ({ activeMenu }) => {
  const { user, clearUser } =
    useContext(UserContext);

  const navigate = useNavigate();

  const [openEditModal, setOpenEditModal] =
    useState(false);

  const handleClick = (route) => {
    if (route === "logout") {
      handleLogout();
      return;
    }

    navigate(route);
  };

  const handleLogout = () => {
    localStorage.clear();
    clearUser();
    navigate("/login");
  };

  return (
    <>
      <div className="w-64 h-[calc(100vh-61px)] bg-white dark:bg-slate-950 border-r border-gray-100 dark:border-slate-800 p-5 sticky top-[61px] z-20 flex flex-col">
        <div className="flex flex-col items-center gap-3 mt-2 mb-6 pb-6 border-b border-gray-100 dark:border-slate-800">
          {user?.profileImageUrl ? (
            <img
              src={user.profileImageUrl}
              alt="Profile"
              className="w-16 h-16 rounded-2xl object-cover shadow-md"
            />
          ) : (
            <CharAvatar
              fullName={user?.fullName}
              width="w-16"
              height="h-16"
              style="text-xl"
            />
          )}

          <div className="text-center">
            <h5 className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">
              {user?.fullName || ""}
            </h5>

            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate max-w-[180px]">
              {user?.email || ""}
            </p>
          </div>

          <button
            onClick={() =>
              setOpenEditModal(true)
            }
            className="flex items-center gap-2 text-xs bg-primary/10 text-primary px-4 py-2 rounded-xl hover:bg-primary hover:text-white transition-all duration-200"
          >
            <LuPencilLine />
            Edit Profile
          </button>
        </div>

        <nav className="flex-1 space-y-1">
          {SIDE_MENU_DATA.map(
            (item, index) => (
              <button
                key={`menu_${index}`}
                className={`w-full flex items-center gap-3 text-sm py-3 px-4 rounded-xl mb-1 transition-all duration-200
              ${
                activeMenu === item.label
                  ? "bg-primary text-white shadow-md shadow-purple-500/30 font-semibold"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-primary dark:hover:text-primary"
              }
              ${
                item.id === "05"
                  ? "mt-auto border-t border-gray-100 dark:border-slate-800 pt-3"
                  : ""
              }
            `}
                onClick={() =>
                  handleClick(item.path)
                }
              >
                <item.icon className="text-lg flex-shrink-0" />
                {item.label}
              </button>
            )
          )}
        </nav>
      </div>

      <EditProfileModal
        isOpen={openEditModal}
        onClose={() =>
          setOpenEditModal(false)
        }
      />
    </>
  );
};

export default SideMenu;