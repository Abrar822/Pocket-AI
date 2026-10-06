import "./memory.css";
import { Trash2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";

export default function Memory({ theme, setTheme }) {
  
  return (
    <>
      <div className="h-full w-full flex overflow-auto overflow-x-hidden justify-start flex-col items-center pt-[20px]">
        <div className="flex justify-start items-center gap-[20px] w-full pl-[125px] h-[40px]">
          <input
          type="text"
          className="h-full w-full max-w-[450px] bg-white px-3 py-2 rounded-md outline-none"
          placeholder="Search Folder.."
        />
        <button className="search-btn">Search</button>
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
            <tr>
              <td>Docs</td>
              <td>docs </td>
              <td>
                <Trash2 size={18} className="cursor-pointer ti-trash" />
              </td>
            </tr>
          </tbody>
        </table>
        <div className="btn-container">
          <button className="add-location-btn">Add Path</button>
          <button className="insert-btn">Insert Paths</button>
        </div>
        <table className="path-table">
          <thead>
            <tr>
              <th>Path</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Docs</td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}
