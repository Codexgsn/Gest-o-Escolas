
'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { 
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ListFilter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCallback } from 'react';

interface FilterDropdownProps {
  availableTags: string[];
  selectedTags: string[];
}

export function FilterDropdown({ availableTags, selectedTags }: FilterDropdownProps) {
  const router = useRouter();
  const pathname = usePathname();

  const createQueryString = useCallback((params: Record<string, string | string[]>) => {
    const newSearchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(v => newSearchParams.append(key, v));
      } else {
        newSearchParams.set(key, value);
      }
    });
    return newSearchParams.toString();
  }, []);

  const handleTagFilterChange = (tag: string, checked: boolean) => {
    const newSelectedTags = checked
      ? [...selectedTags, tag]
      : selectedTags.filter((t) => t !== tag);
    
    const queryString = createQueryString({ tags: newSelectedTags });
    router.push(`${pathname}?${queryString}`);
  };

  const clearFilters = () => {
      router.push(pathname);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full md:w-auto">
          <ListFilter className="mr-2 h-4 w-4" />
          Filtrar por Tags
          {selectedTags.length > 0 && <Badge variant="secondary" className="ml-2">{selectedTags.length}</Badge>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[250px]">
        <DropdownMenuLabel>Selecione as tags</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {availableTags.length > 0 ? (
          availableTags.map((tag) => (
            <DropdownMenuCheckboxItem
              key={tag}
              checked={selectedTags.includes(tag)}
              onCheckedChange={(checked) => handleTagFilterChange(tag, !!checked)}
            >
              {tag}
            </DropdownMenuCheckboxItem>
          ))
        ) : (
          <div className="px-2 py-1.5 text-sm text-muted-foreground">Nenhuma tag disponível.</div>
        )}
        {selectedTags.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={clearFilters} className="text-destructive">
              Limpar filtros
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
