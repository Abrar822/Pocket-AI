import "./memory.css";
import { Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../home/Sidebar";
import Navbar from "../home/Nav";
import { useEffect, useState } from "react";
import { search, deleteFolders, insert, display } from "./memory_api_calls";
import { open } from "@tauri-apps/plugin-dialog";

export default function MemoryPage({
  theme,
  collapsed,
  setCollapsed,
  setInformer,
}) {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState("");
  const [folders, setFolders] = useState([]);
  const [selectedFolders, setSelectedFolders] = useState([]);

  const handleDashboardClick = () => {
    navigate("/");
  };

  const handleMemoryClick = () => {
    navigate("/memory");
  };

  const handleSettingsClick = () => {
    navigate("/settings");
  };

  const searchFolder = async () => {
    try {
      let data = await search(searchInput);
      setFolders(data);
    } catch (err) {
      setInformer({ msg: err.message, state: true });
    }
  };

  useEffect(() => {
    const see = async () => {
      let data = await display();
      setFolders(data);
    };
    try {
      see();
    } catch (err) {
      setInformer({ msg: err.message, state: true });
    }
  }, []);

  useEffect(() => {
    const execute = async () => {
      if (searchInput.length == 0) {
        await searchFolder();
      }
    };
    execute();
  }, [searchInput]);

  useEffect(() => {
    console.log(selectedFolders);
  }, [selectedFolders]);

  const addPath = async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: "Select Folder",
      });
      if (selected) {
        setSelectedFolders((prev) => [...prev, selected]);
      }
    } catch (err) {
      console.log(err);
      setInformer({ msg: "Failed to open Folder Picker.", state: true });
    }
  };

  const insertFolders = async () => {
    try {
      let data = await insert(selectedFolders);
      if (data) {
        setFolders((prev) => [...prev, ...data]);
        setInformer({msg: 'Folders inserted successfully.', state: true})
        setSelectedFolders([])
      }
    } catch (err) {
      setInformer({msg: err.message, state: true})
    }
  };

  return (
    <div className={`app ${theme}`}>
      <Sidebar
        collapsed={collapsed}
        onDashboardClick={handleDashboardClick}
        onMemoryClick={handleMemoryClick}
        onSettingClick={handleSettingsClick}
        theme={theme}
      />
      <div className={`app-content ${theme}`}>
        <Navbar
          onMenuClick={() => setCollapsed((prev) => !prev)}
          theme={theme}
        />
        <main className={`main-content ${theme}`}>
          <div className="h-full w-full flex overflow-auto overflow-x-hidden justify-start flex-col items-center pt-[20px]">
            <div className="flex justify-start items-center gap-[20px] w-full pl-[125px] h-[40px]">
              <input
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                }}
                type="text"
                className="h-full w-full max-w-[450px] bg-white px-3 py-2 rounded-md outline-none"
                placeholder="Search Folder.."
              />
              <button
                className="search-btn"
                onClick={async () => {
                  await searchFolder();
                }}
              >
                Search
              </button>
            </div>
            <table className="memory-table">
              <thead>
                <tr>
                  <th>Foldername</th>
                  <th>Location</th>
                  <th>Delete</th>
                </tr>
              </thead>
              <tbody>
                {folders.length > 0 &&
                  folders.map((folder, idx) => (
                    <tr key={idx}>
                      <td>
                        {folder.location.split("\\").pop()
                          ? folder.location.split("\\").pop()
                          : folder.location[0].toUpperCase()}
                      </td>
                      <td>{folder.location}</td>
                      <td
                        onClick={async () => {
                          try {
                            let msg = await deleteFolders([folder.f_name]);
                            if (msg) {
                              setInformer({
                                msg: `Folder ${folder.f_name} deleted successfully.`,
                                state: true,
                              });
                            }
                            let arr = folders.filter(
                              (f) => f.f_name !== folder.f_name,
                            );
                            setFolders(arr);
                          } catch (err) {
                            setInformer({ msg: err.message, state: true });
                          }
                        }}
                      >
                        <Trash2 size={18} className="cursor-pointer ti-trash" />
                      </td>
                    </tr>
                  ))}
              </tbody>
              {folders.length == 0 && (
                <p className="px-3 py-2 text-center">No Folder Exist</p>
              )}
            </table>
            {/* {folders.length == 0 && <p>No Folder Exist</p>} */}
            <div className="btn-container">
              <button className="add-location-btn" onClick={addPath}>
                Add Path
              </button>
              <button className="insert-btn" onClick={async () => {
                await insertFolders()
              }}>
                Insert Paths
              </button>
            </div>
            <table className="path-table">
              <thead>
                <tr>
                  <th>Foldername</th>
                  <th>Path</th>
                </tr>
              </thead>
              <tbody>
                {selectedFolders.length > 0 &&
                  selectedFolders.map((f) => (
                    <tr>
                      <td>
                        {f?.split("\\")?.pop()
                          ? f?.split("\\")?.pop()
                          : f[0].toUpperCase()}
                      </td>
                      <td>{f}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}