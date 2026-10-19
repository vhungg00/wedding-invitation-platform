/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import {
  CSSProperties,
  ReactNode,
  useCallback,
  useMemo,
  useRef,
  MouseEvent,
  useEffect,
  useState,
} from "react";
import * as CSS from "csstype";

const SIZE_DRAG = 16;

// eslint-disable-next-line react-refresh/only-export-components
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
  align?: CSS.Property.TextAlign;
};

type ChangeLayoutEvent = {
  x: number;
  y: number;
  width: number;
  height: number;
  top: number;
  right: number;
  left: number;
  bottom: number;
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

export function TableResize<T = any>(props: TableResizeProps<T>) {
  const {
    data = [],
    className,
    columns = [],
    bordered,
    keyExtractor,
    style,
    thStyle,
    tdStyle,
    resizable,
    loading,
    empty,
    minWidthResize = 56,
    onSort,
    sortKey,
    sortType,
    onSelect,
    tableHeight,
    rowStyle,
  } = props;

  const [widthTable, setWidthTable] = useState<number>();
  const [colWidths, setColWidths] = useState<string[]>([]);

  const refTable = useRef<HTMLDivElement>(null);
  const refResize = useRef<HTMLDivElement>(null);
  const refScrollY = useRef<HTMLDivElement>(null);
  const refScrollX = useRef<HTMLDivElement>(null);
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
      let width = b.width || 0;
      if (typeof width === "string") {
        if (width.includes("px")) {
          width = Number(width.replace("px", ""));
        } else width = 0;
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
        if (!width) return minWidth ? (typeof minWidth === "number" ? `${minWidth}px` : minWidth) : undefined;
        if (typeof width === "string") return width;
        return `${width}px`;
      }
      const totalColNonWidth = columns.filter((e) => !e.width).length;
      if (widthTable !== undefined && widthTable > minWidthTable && totalColNonWidth > 0) {
        if (!width) {
          return `${(widthTable - minWidthTable) / totalColNonWidth}px`;
        }
      } else if (!width) {
        if (totalColNonWidth > 0) {
          return `calc(${100 / totalColNonWidth}% - ${minWidthTable}px)`;
        }
        return minWidth ? (typeof minWidth === "number" ? `${minWidth}px` : minWidth) : "140px";
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
      v = v[k as keyof T];
    });
    return v;
  }, []);

  const getChildren = useCallback(
    (column: TColumn<T>, item: T, rowIndex: number) => {
      const { render, dataIndex, name, key } = column;
      if (typeof render === "function") {
        return render(
          getValueSplit(item, name || dataIndex || key),
          item,
          rowIndex
        );
      }
      return (
        <span
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            display: "block",
          }}
        >
          {getValueSplit(item, name || dataIndex || key)}
        </span>
      );
    },
    [getValueSplit]
  );

  const onMouseDown = useCallback((event: MouseEvent<HTMLDivElement>) => {
    xControl.current = event.pageX;
  }, []);

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

  const onMouseMove = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      const { x } = xResControl.current;
      if (x !== undefined) {
        return onMouseMoveResize(event);
      }
      if (!xControl.current || !refTable.current) return;
      const { scrollLeft } = refTable.current;
      const scrollX = scrollLeft - (xControl.current - event.pageX) / 10;
      refTable.current.scrollTo({ left: scrollX });
    },
    [onMouseMoveResize]
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
        (widthTable - width) / listNoneWidth.length;
      if (widthChange < 56) widthChange = 56;
      widthChange = `${widthChange}px`;
      th.style.width = widthChange;
      th.style.maxWidth = widthChange;
      th.style.minWidth = widthChange;
      const tds = refTable.current?.querySelectorAll(
        `.table-tr .table-td:nth-child(${i! + 1})`
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
      element.style.width = `${width + size}px`;
      element.style.maxWidth = `${width + size}px`;
      element.style.minWidth = `${width + size}px`;
      onApplyNewSizeNonWidth();
    },
    [onApplyNewSizeNonWidth]
  );

  const onMouseUpResize = useCallback(() => {
    const { x, x2, index } = xResControl.current;
    if ([x, x2, index].includes(undefined)) return;
    const change = x2! - x!;
    const th = refTh.current?.querySelector(
      `.table-th:nth-child(${index! + 1})`
    ) as HTMLElement;
    appendResize(th, change);
    const tds = refTable.current?.querySelectorAll(
      `.table-tr .table-td:nth-child(${index! + 1})`
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

  const onMouseDownResize = useCallback(
    (event: MouseEvent<HTMLDivElement>, index: number) => {
      event.preventDefault();
      event.stopPropagation();
      if (!refResize.current || !refTable.current) return;
      const { left } = refTable.current.getBoundingClientRect();
      const { scrollLeft } = refTable.current;
      const th = refTh.current?.querySelector(
        `.table-th:nth-child(${index! + 1})`
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

  const onScrollY = useCallback(() => {
    if (!refTable.current || !refScrollY.current || !refTh.current) return;
    const { scrollTop, scrollHeight } = refTable.current;
    const { height: h } = refTh.current.getBoundingClientRect();
    const { height } = refTable.current.getBoundingClientRect();
    const heightBar = refScrollY.current.getBoundingClientRect().height;
    const hHeader = h + 3;
    const percentTop = scrollTop / (scrollHeight - height);
    refScrollY.current.style.top = `${
      hHeader + percentTop * (height - heightBar - 10 - hHeader)
    }px`;
  }, []);

  const calculateScrollY = useCallback(
    (rect: ChangeLayoutEvent) => {
      if (!refTable.current || !refScrollY.current || !refTh.current) return;
      const { height, scrollHeight } = rect;
      if (height >= scrollHeight) {
        refScrollY.current.style.display = "none";
        return;
      }
      refScrollY.current.style.display = "";
      const heightBar = (height / scrollHeight) * height;
      refScrollY.current.style.height = `${heightBar}px`;
      onScrollY();
    },
    [onScrollY]
  );

  const onScrollX = useCallback(() => {
    if (!refTable.current || !refScrollY.current || !refTh.current) return;
    if (!refTable.current || !refScrollX.current || !refTh.current) return;
    const { scrollWidth } = refTable.current;
    const { width } = refTable.current.getBoundingClientRect();
    const { scrollLeft } = refTable.current;
    const widthBar = refScrollX.current.getBoundingClientRect().width;
    const percentLeft = scrollLeft / (scrollWidth - width);
    refScrollX.current.style.left = `${
      3 + percentLeft * (width - widthBar - 6)
    }px`;
  }, []);

  const calculateScrollX = useCallback(
    (rect: ChangeLayoutEvent) => {
      if (!refTable.current || !refScrollX.current || !refTh.current) return;
      const { width, scrollWidth } = rect;
      if (width >= scrollWidth) {
        refScrollX.current.style.display = "none";
        return;
      }
      refScrollX.current.style.display = "";
      const percent = width / scrollWidth;
      refScrollX.current.style.width = `${percent * width}px`;
      onScrollX();
    },
    [onScrollX]
  );

  const onLayout = useCallback(
    (rect: ChangeLayoutEvent) => {
      calculateScrollY(rect);
      calculateScrollX(rect);
      setWidthTable(rect.width);
    },
    [calculateScrollX, calculateScrollY]
  );

  const onScroll = useCallback(() => {
    onScrollY();
    onScrollX();
  }, [onScrollX, onScrollY]);

  useEffect(() => {
    if (!refTable.current) return;
    const element = refTable.current;
    const resizeObserver = new ResizeObserver((entries) => {
      if (entries.length) {
        const rect = entries[0].contentRect;
        const { x, y, left, top, width, height, bottom, right } = rect;
        const rectObject: ChangeLayoutEvent = {
          x,
          y,
          width,
          height,
          top,
          right,
          bottom,
          left,
          scrollHeight: element.scrollHeight,
          scrollWidth: element.scrollWidth,
        };
        onLayout(rectObject);
      }
    });
    resizeObserver.observe(element);
    return () => {
      resizeObserver.unobserve(element);
    };
  }, [onLayout]);

  const onClickColumn = useCallback(
    (column: TColumn<T>) => {
      const colIdent = column.name || column.dataIndex || column.key;
      let newType = sortType === ESortType.ASC ? ESortType.DESC : ESortType.ASC;
      if (colIdent !== sortKey) {
        newType = ESortType.DESC;
      }
      onSort?.(column, newType);
    },
    [onSort, sortKey, sortType]
  );

  return (
    <div
      className={className}
      style={{ position: "relative", width: "100%", ...style }}
      onMouseDown={onMouseDown}
      onMouseLeave={onMouseUp}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
    >
      <div
        ref={refTable}
        style={{
          position: "relative",
          width: "100%",
          overflow: "auto",
          maxHeight: tableHeight,
          scrollbarWidth: "thin",
          scrollbarColor: "#d9d9d9 transparent",
        }}
        onScroll={onScroll}
      >
        <div style={{ minWidth: "max-content", width: "100%", position: "relative" }}>
          {/* Header */}
          <div
            ref={refTh}
            style={{
              backgroundColor: "#fafafa",
              borderBottom: "1px solid #e8e8e8",
              display: "flex",
              flexDirection: "row",
              left: 0,
              minWidth: "max-content",
              width: "100%",
              position: "sticky",
              top: 0,
              zIndex: 3,
              ...thStyle,
            }}
          >
            {columns.map((column, i) => {
              const colIdent = column.name || column.dataIndex || column.key;
              const isSorting = sortKey === colIdent;

              return (
                <div
                  key={`${column.key || column.dataIndex || column.name}_${i}`}
                  className="table-th"
                  style={{
                    borderRight:
                      bordered && i !== columns.length - 1
                        ? "1px solid #e8e8e8"
                        : "none",
                    color: "#595959",
                    cursor: column?.sortable ? "pointer" : "default",
                    fontSize: 14,
                    fontWeight: 500,
                    maxWidth: getWidth(column, i),
                    minWidth: getWidth(column, i),
                    padding: "12px 8px",
                    position: "relative",
                    width: getWidth(column, i),
                    userSelect: "none",
                  }}
                  onClick={() => column?.sortable && onClickColumn(column)}
                >
                  <div
                    style={{
                      alignItems: "center",
                      display: "flex",
                      justifyContent: column?.sortable
                        ? "space-between"
                        : (column.align ?? "flex-start"),
                      overflow: "hidden",
                      position: "relative",
                      width: "100%",
                      gap: 4,
                    }}
                  >
                    <span
                      title={typeof column.title === "string" ? column.title : undefined}
                      style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        fontWeight: 500,
                      }}
                    >
                      {column.title}
                    </span>
                    {column.sortable && (
                      <span
                        style={{
                          display: "inline-flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 1,
                          flexShrink: 0,
                        }}
                      >
                        <ChevronUp
                          style={{
                            width: 12,
                            height: 12,
                            color:
                              isSorting && sortType === ESortType.ASC
                                ? "#FF5100"
                                : "#bfbfbf",
                            strokeWidth: 2.5,
                          }}
                        />
                        <ChevronDown
                          style={{
                            width: 12,
                            height: 12,
                            color:
                              isSorting && sortType === ESortType.DESC
                                ? "#FF5100"
                                : "#bfbfbf",
                            strokeWidth: 2.5,
                            marginTop: -4,
                          }}
                        />
                      </span>
                    )}
                  </div>
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
                        zIndex: 1,
                      }}
                      onMouseDown={(e) => onMouseDownResize(e, i)}
                    />
                  ) : null}
                </div>
              );
            })}
          </div>

          {/* Body */}
          {data.map((d, i) => (
            <div
              key={keyExtractor?.(d, i) || i}
              className="table-tr"
              style={{
                borderBottom: "1px solid #f0f0f0",
                cursor: onSelect ? "pointer" : "default",
                display: "flex",
                flexDirection: "row",
                minWidth: "max-content",
                width: "100%",
                backgroundColor: "#ffffff",
                ...rowStyle?.(d, i),
              }}
              onClick={() => onSelect?.(d, i)}
            >
              {columns.map((column, ci) => (
                <div
                  key={`${column.key || column.dataIndex || column.name}_${ci}`}
                  className="table-td"
                  style={{
                    alignItems: "center",
                    borderRight:
                      bordered && ci !== columns.length - 1
                        ? "1px solid #f0f0f0"
                        : "none",
                    color: "#262626",
                    display: "flex",
                    fontSize: 14,
                    fontWeight: 400,
                    maxWidth: getWidth(column, ci),
                    minWidth: getWidth(column, ci),
                    padding: "4px 8px",
                    position: "relative",
                    width: getWidth(column, ci),
                    ...tdStyle,
                    ...column.style,
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                    }}
                  >
                    {getChildren(column, d, i)}
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
              ))}
            </div>
          ))}

          {/* Resize indicator line */}
          <div
            ref={refResize}
            style={{
              cursor: "col-resize",
              display: "none",
              height: "100%",
              paddingLeft: `${SIZE_DRAG / 2}px`,
              paddingRight: `${SIZE_DRAG / 2}px`,
              position: "absolute",
              top: 0,
              width: `${SIZE_DRAG + 1}px`,
              zIndex: 9999,
            }}
          >
            <div
              style={{
                background: "#FF5100",
                height: "100%",
                width: "1px",
              }}
            />
          </div>
        </div>

        {!loading && data?.length === 0 && (
          <div
            style={{
              alignItems: "center",
              color: "#8c8c8c",
              display: "flex",
              justifyContent: "center",
              padding: "47px 0",
              width: "100%",
            }}
          >
            {empty ?? <span>No data</span>}
          </div>
        )}
      </div>

      {loading && (
        <div
          style={{
            alignItems: "center",
            background: "rgba(255,255,255,0.6)",
            bottom: 0,
            display: "flex",
            justifyContent: "center",
            left: 0,
            position: "absolute",
            right: 0,
            top: 0,
            zIndex: 10,
          }}
        >
          <Loader2
            style={{
              width: 28,
              height: 28,
              color: "#FF5100",
              animation: "spin 1s linear infinite",
            }}
          />
        </div>
      )}
    </div>
  );
}

export default TableResize;
