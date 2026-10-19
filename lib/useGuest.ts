"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export interface GuestInfo {
  id?: string;
  name: string;
  slug?: string;
  side?: "nha-trai" | "nha-gai";
  phone?: string;
  isResolvedFromDb: boolean;
}

export function useGuest() {
  const searchParams = useSearchParams();
  const rawParam =
    searchParams.get("g") ||
    searchParams.get("guest") ||
    searchParams.get("slug") ||
    searchParams.get("to") ||
    searchParams.get("khach");

  const [guest, setGuest] = useState<GuestInfo | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!rawParam) {
      setGuest(null);
      return;
    }

    const trimmed = rawParam.trim();
    // Kiểm tra xem rawParam có phải là dạng slug (không dấu, không khoảng trắng, vd: chi-thao-1002)
    const isLikelySlug = /^[a-z0-9-]+$/i.test(trimmed) && trimmed.includes("-");

    let isMounted = true;

    // Nếu có vẻ là slug hoặc param tường minh là g/guest/slug
    const isExplicitSlugParam = Boolean(
      searchParams.get("g") || searchParams.get("guest") || searchParams.get("slug")
    );

    if (isLikelySlug || isExplicitSlugParam) {
      setLoading(true);
      fetch(`/api/guests?slug=${encodeURIComponent(trimmed)}`)
        .then((res) => res.json())
        .then((data) => {
          if (!isMounted) return;
          if (data.success && data.data) {
            setGuest({
              id: data.data.id,
              name: data.data.name,
              slug: data.data.slug,
              side: data.data.side,
              phone: data.data.phone || "",
              isResolvedFromDb: true,
            });
          } else {
            // Không tìm thấy slug trong DB, fallback dùng chính chuỗi đó làm tên
            setGuest({
              name: trimmed,
              isResolvedFromDb: false,
            });
          }
        })
        .catch(() => {
          if (!isMounted) return;
          setGuest({
            name: trimmed,
            isResolvedFromDb: false,
          });
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    } else {
      // Tên trực tiếp (vd: ?to=Chị Thảo & Gia đình)
      setGuest({
        name: trimmed,
        isResolvedFromDb: false,
      });
    }

    return () => {
      isMounted = false;
    };
  }, [rawParam, searchParams]);

  return { guest, loading, rawParam };
}
