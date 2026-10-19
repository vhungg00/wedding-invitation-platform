"use client";

import React, {
  CSSProperties,
  ReactNode,
  useCallback,
  useMemo,
  useRef,
  MouseEvent,
  useEffect,
  useState,
} from "react";
import { ChevronUp, ChevronDown, Loader2 } from "lucide-react";

const SIZE_DRAG = 16;

export enum ESortType {
  ASC = "asc",
  DESC = "desc",
}

export type TColumn<T = any> = {
  title?: ReactNode;
  name?: string;
  dataIndex?: string;
  key?: string;
  sortable?: boolean;
  resizable?: boolean;
  render?: (value: any, record: T, index: number) => ReactNode;
  width?: number | string;
  maxWidth?: number | string;
  minWidth?: number | string;
  style?: CSSProperties;
  align?: "left" | "center" | "right";
};

type ChangeLayoutEvent = {
  width: number;
  height: number;
  scrollWidth: number;
  scrollHeight: number;
};

export type TableResizeProps<T = any> = {
  data?: T[];
  className?: string;
  columns: TColumn<T>[];
  bordered?: boolean;
  keyExtractor?: (item: T, index: number) => string | number;
  style?: CSSProperties;
  thStyle?: CSSProperties;
  tdStyle?: CSSProperties;
  resizable?: boolean;
  loading?: boolean;
  empty?: ReactNode;
  minWidthResize?: number;
  sortKey?: string;
  sortType?: ESortType;
  onSort?: (column: TColumn<T>, type: ESortType) => void;
  onSelect?: (item: T, index: number) => void;
  tableHeight?: string | number;
  rowStyle?: (item: T, index: number) => CSSProperties;
};

export function TableResize<T = any>({
  data = [],
  className = "",
  columns = [],
  bordered = false,
  keyExtractor,
  style,
  thStyle,
  tdStyle,
  resizable = true,
  loading = false,
  empty,
  minWidthResize = 60,
  onSort,
  sortKey,
  sortType,
  onSelect,
  tableHeight,
  rowStyle,
}: TableResizeProps<T>) {
  const [widthTable, setWidthTable] = useState<number>();
  const [colWidths, setColWidths] = useState<string[]>([]);

  const refTable = useRef<HTMLDivElement>(null);
  const refResize = useRef<HTMLDivElement>(null);
  const refTh = useRef<HTMLDivElement>(null);
  const xControl = useRef<number | undefined>(undefined);
  const xResControl = useRef<{
    x?: number;
    x2?: number;
    index?: number;
    minX?: number;
  }>({});

  const listNoneWidth = useMemo(() => {
    return columns.reduce((a: number[], b, i) => {
      if (b.width === undefined) a.push(i);
      return a;
    }, []);
  }, [columns]);

  const minWidthTable = useMemo(() => {
    return columns.reduce((a, b) => {
      let width = b.width || 120;
      if (typeof width === "string") {
        if (width.includes("px")) {
          width = Number(width.replace("px", ""));
        } else {
          width = 120;
        }
      }
      return a + (width as number);
    }, 0);
  }, [columns]);

  const getWidth = useCallback(
    (column: TColumn<T>, colIndex?: number) => {
      if (colIndex !== undefined && colWidths[colIndex]) {
        return colWidths[colIndex];
      }
      const { width, minWidth } = column;
      if (!resizable) {
        if (!width) return minWidth || "140px";
        if (typeof width === "string") return width;
        return `${width}px`;
      }
      const totalColNonWidth = columns.filter((e) => !e.width).length || 1;
      if (widthTable !== undefined && widthTable > minWidthTable) {
        if (!width) {
          return `${(widthTable - minWidthTable) / totalColNonWidth}px`;
        }
      } else if (!width) {
        return minWidth ? `${minWidth}` : "140px";
      }
      if (typeof width === "string") return width;
      return `${width}px`;
    },
    [colWidths, columns, minWidthTable, resizable, widthTable]
  );

  const getValueSplit = useCallback((value: T, key?: string) => {
    if (!key) return undefined;
    const keys = key.split(".");
    let v: any = value;
    keys.forEach((k) => {
      if (v) v = v[k as keyof typeof v];
    });
    return v;
  }, []);

  const getChildren = useCallback(
    (column: TColumn<T>, item: T, rowIndex: number) => {
      const { render, dataIndex, name, key } = column;
      const val = getValueSplit(item, name || dataIndex || key);
      if (typeof render === "function") {
        return render(val, item, rowIndex);
      }
      return <span className="truncate">{val ?? "-"}</span>;
    },
    [getValueSplit]
  );

  const onMouseDownResize = useCallback(
    (event: MouseEvent<HTMLDivElement>, index: number) => {
      event.preventDefault();
      event.stopPropagation();
      if (!refResize.current || !refTable.current) return;
      const { left } = refTable.current.getBoundingClientRect();
      const { scrollLeft } = refTable.current;
      const th = refTh.current?.querySelector(
        `.table-th:nth-child(${index + 1})`
      ) as HTMLElement;
      if (th) {
        const { width } = th.getBoundingClientRect();
        xResControl.current.minX = event.pageX - width;
      }
      xResControl.current.x = event.pageX;
      xResControl.current.index = index;
      refResize.current.style.display = "block";
      refResize.current.style.left = `${
        event.pageX - left - SIZE_DRAG / 2 + scrollLeft
      }px`;
    },
    []
  );

  const onMouseMoveResize = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      const { x, minX } = xResControl.current;
      if (x === undefined) return;
      if (!refResize.current || !refTable.current) return;
      const { left } = refTable.current.getBoundingClientRect();
      xResControl.current.x2 = event.pageX;
      if (minX !== undefined && event.pageX <= minX + minWidthResize) {
        xResControl.current.x2 = minX + minWidthResize;
      }
      const { scrollLeft } = refTable.current;
      refResize.current.style.left = `${
        xResControl.current.x2 - left - SIZE_DRAG / 2 + scrollLeft
      }px`;
    },
    [minWidthResize]
  );

  const onApplyNewSizeNonWidth = useCallback(() => {
    const { index } = xResControl.current;
    if (index === undefined || !widthTable || !refTh.current) return;
    const ths = refTh.current.querySelectorAll(
      `.table-th`
    ) as NodeListOf<HTMLDivElement>;
    const width = Array.from(ths).reduce((a, b, idx) => {
      if (!listNoneWidth.includes(idx)) {
        a += b.getBoundingClientRect().width;
      }
      return a;
    }, 0);
    listNoneWidth.forEach((i) => {
      const th = refTh.current?.querySelector(
        `.table-th:nth-child(${i + 1})`
      ) as HTMLElement;
      let widthChange: string | number =
        (widthTable - width) / (listNoneWidth.length || 1);
      if (widthChange < 60) widthChange = 60;
      widthChange = `${widthChange}px`;
      if (th) {
        th.style.width = widthChange;
        th.style.maxWidth = widthChange;
        th.style.minWidth = widthChange;
      }
      const tds = refTable.current?.querySelectorAll(
        `.table-tr .table-td:nth-child(${i + 1})`
      ) as NodeListOf<HTMLDivElement>;
      Array.from(tds || []).forEach((td) => {
        td.style.width = widthChange;
        td.style.maxWidth = widthChange;
        td.style.minWidth = widthChange;
      });
    });
  }, [listNoneWidth, widthTable]);

  const appendResize = useCallback(
    (element?: HTMLElement, size: number = 0) => {
      if (!element) return;
      const { width } = element.getBoundingClientRect();
      const newWidth = Math.max(minWidthResize, width + size);
      element.style.width = `${newWidth}px`;
      element.style.maxWidth = `${newWidth}px`;
      element.style.minWidth = `${newWidth}px`;
      onApplyNewSizeNonWidth();
    },
    [minWidthResize, onApplyNewSizeNonWidth]
  );

  const onMouseUpResize = useCallback(() => {
    const { x, x2, index } = xResControl.current;
    if ([x, x2, index].includes(undefined)) return;
    const change = (x2 || 0) - (x || 0);
    const th = refTh.current?.querySelector(
      `.table-th:nth-child(${(index || 0) + 1})`
    ) as HTMLElement;
    appendResize(th, change);
    const tds = refTable.current?.querySelectorAll(
      `.table-tr .table-td:nth-child(${(index || 0) + 1})`
    );
    Array.from(tds || []).forEach((td) =>
      appendResize(td as HTMLElement, change)
    );
  }, [appendResize]);

  const saveColWidths = useCallback(() => {
    if (!refTh.current) return;
    const ths = refTh.current.querySelectorAll(
      ".table-th"
    ) as NodeListOf<HTMLDivElement>;
    setColWidths(Array.from(ths).map((th) => th.style.width));
  }, []);

  const onMouseUp = useCallback(() => {
    onMouseUpResize();
    xControl.current = undefined;
    xResControl.current = {};
    if (refResize.current) refResize.current.style.display = "none";
    saveColWidths();
  }, [onMouseUpResize, saveColWidths]);

  const onMouseDown = useCallback((event: MouseEvent<HTMLDivElement>) => {
    xControl.current = event.pageX;
  }, []);

  const onMouseMove = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      const { x } = xResControl.current;
      if (x !== undefined) {
        return onMouseMoveResize(event);
      }
    },
    [onMouseMoveResize]
  );

  useEffect(() => {
    if (!refTable.current) return;
    const element = refTable.current;
    const resizeObserver = new ResizeObserver((entries) => {
      if (entries.length) {
        const rect = entries[0].contentRect;
        setWidthTable(rect.width);
      }
    });
    resizeObserver.observe(element);
    return () => {
      resizeObserver.unobserve(element);
    };
  }, []);

  const onClickColumn = useCallback(
    (column: TColumn<T>) => {
      let newType = sortType === ESortType.ASC ? ESortType.DESC : ESortType.ASC;
      if (column.name !== sortKey && column.dataIndex !== sortKey) {
        newType = ESortType.DESC;
      }
      onSort?.(column, newType);
    },
    [onSort, sortKey, sortType]
  );

  return (
    <div
      className={`relative w-full rounded-2xl border border-gray-100 overflow-hidden bg-white ${className}`}
      style={style}
      onMouseDown={onMouseDown}
      onMouseLeave={onMouseUp}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
    >
      {/* Scrollable Container with horizontal touch scroll */}
      <div
        ref={refTable}
        style={{
          position: "relative",
          width: "100%",
          overflowX: "auto",
          overflowY: tableHeight ? "auto" : "visible",
          maxHeight: tableHeight,
          WebkitOverflowScrolling: "touch",
        }}
        className="custom-scrollbar"
      >
        <div
          style={{
            minWidth: "max-content",
            width: "100%",
            position: "relative",
          }}
        >
          {/* Header */}
          <div
            ref={refTh}
            style={{
              position: "sticky",
              top: 0,
              zIndex: 10,
              minWidth: "max-content",
              ...thStyle,
            }}
            className="flex flex-row bg-gray-50/95 backdrop-blur-sm border-b border-gray-200 text-[11px] sm:text-xs font-semibold uppercase text-gray-600 select-none"
          >
            {columns.map((column, i) => {
              const colKey =
                column.key || column.dataIndex || column.name || `col_${i}`;
              const isSorting =
                sortKey === (column.name || column.dataIndex || column.key);
              const colWidth = getWidth(column, i);

              return (
                <div
                  key={`${colKey}_${i}`}
                  className="table-th flex items-center justify-between px-3.5 py-3 relative"
                  style={{
                    width: colWidth,
                    minWidth: colWidth,
                    maxWidth: colWidth,
                    borderRight:
                      bordered && i !== columns.length - 1
                        ? "1px solid #e5e7eb"
                        : "none",
                    cursor: column.sortable ? "pointer" : "default",
                  }}
                  onClick={() => column.sortable && onClickColumn(column)}
                >
                  <div
                    className={`flex items-center gap-1.5 w-full overflow-hidden ${
                      column.align === "center"
                        ? "justify-center"
                        : column.align === "right"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <span
                      title={typeof column.title === "string" ? column.title : undefined}
                      className="truncate font-semibold tracking-wide"
                    >
                      {column.title}
                    </span>

                    {column.sortable && (
                      <span className="inline-flex flex-col items-center shrink-0">
                        <ChevronUp
                          className={`w-3 h-3 -mb-1 ${
                            isSorting && sortType === ESortType.ASC
                              ? "text-rose-600 font-bold"
                              : "text-gray-300"
                          }`}
                        />
                        <ChevronDown
                          className={`w-3 h-3 ${
                            isSorting && sortType === ESortType.DESC
                              ? "text-rose-600 font-bold"
                              : "text-gray-300"
                          }`}
                        />
                      </span>
                    )}
                  </div>

                  {/* Resizer Handle */}
                  {resizable &&
                  column.resizable !== false &&
                  i < columns.length - 1 ? (
                    <div
                      style={{
                        cursor: "col-resize",
                        height: "100%",
                        position: "absolute",
                        right: `${-SIZE_DRAG / 4}px`,
                        top: 0,
                        width: `${SIZE_DRAG / 2}px`,
                        zIndex: 2,
                      }}
                      className="hover:bg-rose-400/40 transition"
                      onMouseDown={(e) => onMouseDownResize(e, i)}
                    />
                  ) : null}
                </div>
              );
            })}
          </div>

          {/* Body Rows */}
          <div className="divide-y divide-gray-100">
            {data.map((item, i) => (
              <div
                key={keyExtractor?.(item, i) || i}
                className="table-tr flex flex-row items-center hover:bg-rose-50/40 transition-colors text-xs sm:text-sm text-gray-800"
                style={{
                  minWidth: "max-content",
                  cursor: onSelect ? "pointer" : "default",
                  ...rowStyle?.(item, i),
                }}
                onClick={() => onSelect?.(item, i)}
              >
                {columns.map((column, ci) => {
                  const colKey =
                    column.key || column.dataIndex || column.name || `col_${ci}`;
                  const colWidth = getWidth(column, ci);

                  return (
                    <div
                      key={`${colKey}_${ci}`}
                      className="table-td flex items-center px-3.5 py-3 relative truncate"
                      style={{
                        width: colWidth,
                        minWidth: colWidth,
                        maxWidth: colWidth,
                        borderRight:
                          bordered && ci !== columns.length - 1
                            ? "1px solid #f3f4f6"
                            : "none",
                        justifyContent:
                          column.align === "center"
                            ? "center"
                            : column.align === "right"
                            ? "flex-end"
                            : "flex-start",
                        ...tdStyle,
                        ...column.style,
                      }}
                    >
                      <div className="w-full truncate">
                        {getChildren(column, item, i)}
                      </div>

                      {resizable &&
                      column.resizable !== false &&
                      ci < columns.length - 1 ? (
                        <div
                          style={{
                            cursor: "col-resize",
                            height: "100%",
                            position: "absolute",
                            right: `${-SIZE_DRAG / 4}px`,
                            top: 0,
                            width: `${SIZE_DRAG / 2}px`,
                            zIndex: 1,
                          }}
                          onMouseDown={(e) => onMouseDownResize(e, ci)}
                        />
                      ) : null}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Resize indicator line during drag */}
          <div
            ref={refResize}
            style={{
              cursor: "col-resize",
              display: "none",
              height: "100%",
              position: "absolute",
              top: 0,
              width: "2px",
              backgroundColor: "#f43f5e",
              zIndex: 9999,
              pointerEvents: "none",
            }}
          />
        </div>

        {/* Empty State */}
        {!loading && data.length === 0 && (
          <div className="flex items-center justify-center py-12 px-4 text-center text-xs sm:text-sm text-gray-400 w-full">
            {empty ?? "Chưa có dữ liệu nào phù hợp"}
          </div>
        )}
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white shadow-lg text-xs sm:text-sm font-medium text-rose-600 border border-rose-100 animate-in fade-in zoom-in-95 duration-150">
            <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
            <span>Đang tải dữ liệu...</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default TableResize;
