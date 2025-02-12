import clsx from "clsx";
import oc from "open-color";
import { useEffect, useRef, useState } from "react";
import { useDevice } from "../components/App";
import { exportToSvg } from "../packages/utils";
import { LibraryItem } from "../types";
import "./LibraryUnit.scss";
import { CheckboxItem } from "./CheckboxItem";
import { PlusIcon } from "./icons";

export const LibraryUnit = ({
  id,
  elements,
  isPending,
  onClick,
  selected,
  onToggle,
  onDrag,
  name,
}: {
  id: LibraryItem["id"] | /** for pending item */ null;
  elements?: LibraryItem["elements"];
  isPending?: boolean;
  onClick: () => void;
  selected: boolean;
  onToggle: (id: string, event: React.MouseEvent) => void;
  onDrag: (id: string, event: React.DragEvent) => void;
  name?: string;
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) {
      return;
    }

    (async () => {
      if (!elements) {
        return;
      }
      const svg = await exportToSvg({
        elements,
        appState: {
          exportBackground: false,
          viewBackgroundColor: oc.white,
        },
        files: null,
      });
      svg.querySelector(".style-fonts")?.remove();
      node.innerHTML = svg.outerHTML;
    })();

    return () => {
      node.innerHTML = "";
    };
  }, [elements]);

  const [isHovered, setIsHovered] = useState(false);
  const isMobile = useDevice().isMobile;
  const adder = isPending && (
    <div className="library-unit__adder">{PlusIcon}</div>
  );

  return (
    <div
      className={clsx("library-unit", {
        "library-unit__active": elements,
        "library-unit--hover": elements && isHovered,
        "library-unit--selected": selected,
      })}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={clsx("library-unit__dragger", {
          "library-unit__pulse": !!isPending,
        })}
        ref={ref}
        draggable={!!elements}
        {...(name ? { title: name } : {})}
        onClick={
          !!elements || !!isPending
            ? (event) => {
                if (id && event.shiftKey) {
                  onToggle(id, event);
                } else {
                  onClick();
                }
              }
            : undefined
        }
        onDragStart={(event) => {
          if (!id) {
            event.preventDefault();
            return;
          }
          setIsHovered(false);
          onDrag(id, event);
        }}
      />
      {adder}
      {id && elements && (isHovered || isMobile || selected) && (
        <CheckboxItem
          checked={selected}
          onChange={(checked, event) => onToggle(id, event)}
          className="library-unit__checkbox"
        />
      )}
    </div>
  );
};
