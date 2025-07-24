"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { 
  Filter, 
  X, 
  Search, 
  Check,
  ChevronDown,
  Tag,
  Star
} from "lucide-react"

interface BrandFilterProps {
  availableBrands: string[]
  selectedBrands: string[]
  onBrandChange: (brands: string[]) => void
  isLoading?: boolean
  showFavorites?: boolean
  favoriteBrands?: string[]
  onToggleFavorite?: (brand: string) => void
  className?: string
}

export function BrandFilter({
  availableBrands,
  selectedBrands,
  onBrandChange,
  isLoading,
  showFavorites = true,
  favoriteBrands = [],
  onToggleFavorite,
  className
}: BrandFilterProps) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [viewMode, setViewMode] = React.useState<'all' | 'favorites'>('all')

  // Filter brands based on search query and view mode
  const filteredBrands = React.useMemo(() => {
    let brands = availableBrands

    if (viewMode === 'favorites' && showFavorites) {
      brands = brands.filter(brand => favoriteBrands.includes(brand))
    }

    if (searchQuery) {
      brands = brands.filter(brand => 
        brand.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return brands.sort((a, b) => {
      // Favorites first if showing favorites
      if (showFavorites) {
        const aIsFavorite = favoriteBrands.includes(a)
        const bIsFavorite = favoriteBrands.includes(b)
        if (aIsFavorite && !bIsFavorite) return -1
        if (bIsFavorite && !aIsFavorite) return 1
      }
      return a.localeCompare(b)
    })
  }, [availableBrands, searchQuery, viewMode, favoriteBrands, showFavorites])

  const handleBrandToggle = (brand: string) => {
    const newSelection = selectedBrands.includes(brand)
      ? selectedBrands.filter(b => b !== brand)
      : [...selectedBrands, brand]
    
    onBrandChange(newSelection)
  }

  const handleSelectAll = () => {
    onBrandChange(filteredBrands)
  }

  const handleClearAll = () => {
    onBrandChange([])
  }

  const handlePresetSelection = (preset: string) => {
    switch (preset) {
      case 'favorites':
        if (showFavorites) {
          onBrandChange(favoriteBrands)
        }
        break
      case 'top5':
        // Select first 5 brands (you could enhance this with actual sales data)
        onBrandChange(availableBrands.slice(0, 5))
        break
      case 'all':
        onBrandChange(availableBrands)
        break
      case 'none':
        onBrandChange([])
        break
    }
    setOpen(false)
  }

  const selectedCount = selectedBrands.length
  const totalCount = availableBrands.length

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-2">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="flex gap-2">
              <div className="h-6 w-16 bg-gray-200 rounded"></div>
              <div className="h-6 w-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Filter className="h-5 w-5 text-blue-600" />
              Brand Filter
            </CardTitle>
            <CardDescription>
              {selectedCount === 0 
                ? 'No brands selected' 
                : selectedCount === totalCount 
                  ? 'All brands selected'
                  : `${selectedCount} of ${totalCount} brands selected`
              }
            </CardDescription>
          </div>
          
          {selectedCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="text-muted-foreground hover:text-destructive"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Quick Preset Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCount === totalCount ? "default" : "outline"}
            size="sm"
            onClick={() => handlePresetSelection('all')}
            className="text-xs"
          >
            All Brands
          </Button>
          
          {showFavorites && favoriteBrands.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePresetSelection('favorites')}
              className="text-xs flex items-center gap-1"
            >
              <Star className="h-3 w-3" />
              Favorites
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePresetSelection('top5')}
            className="text-xs"
          >
            Top 5
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePresetSelection('none')}
            className="text-xs"
          >
            None
          </Button>
        </div>

        {/* Multi-select Dropdown */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between text-left"
            >
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                <span>
                  {selectedCount === 0 
                    ? "Select brands..." 
                    : `${selectedCount} brand${selectedCount === 1 ? '' : 's'} selected`
                  }
                </span>
              </div>
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          
          <PopoverContent className="w-80 p-0" align="start">
            <Command>
              <div className="flex items-center border-b px-3">
                <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                <CommandInput
                  placeholder="Search brands..."
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                  className="flex-1"
                />
              </div>
              
              <div className="flex items-center justify-between p-2 border-b bg-muted/30">
                <div className="flex items-center gap-2">
                  {showFavorites && (
                    <Button
                      variant={viewMode === 'favorites' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('favorites')}
                      className="h-7 text-xs"
                    >
                      <Star className="h-3 w-3 mr-1" />
                      Favorites
                    </Button>
                  )}
                  <Button
                    variant={viewMode === 'all' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('all')}
                    className="h-7 text-xs"
                  >
                    All
                  </Button>
                </div>
                
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSelectAll}
                    className="h-7 text-xs"
                    disabled={filteredBrands.length === 0}
                  >
                    Select All
                  </Button>
                </div>
              </div>

              <CommandList className="max-h-64">
                <CommandEmpty>
                  {searchQuery ? "No brands found." : "No brands available."}
                </CommandEmpty>
                
                <CommandGroup>
                  {filteredBrands.map((brand) => {
                    const isSelected = selectedBrands.includes(brand)
                    const isFavorite = favoriteBrands.includes(brand)
                    
                    return (
                      <CommandItem
                        key={brand}
                        value={brand}
                        onSelect={() => handleBrandToggle(brand)}
                        className="flex items-center gap-3 cursor-pointer"
                      >
                        <Checkbox
                          checked={isSelected}
                          onChange={() => handleBrandToggle(brand)}
                          className="data-[state=checked]:bg-primary"
                        />
                        
                        <div className="flex-1 flex items-center justify-between">
                          <span className="font-medium">{brand}</span>
                          
                          <div className="flex items-center gap-1">
                            {showFavorites && onToggleFavorite && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-auto p-1 hover:bg-transparent"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onToggleFavorite(brand)
                                }}
                              >
                                <Star 
                                  className={`h-3 w-3 ${
                                    isFavorite 
                                      ? 'fill-yellow-400 text-yellow-400' 
                                      : 'text-muted-foreground hover:text-yellow-400'
                                  }`} 
                                />
                              </Button>
                            )}
                            
                            {isSelected && (
                              <Check className="h-4 w-4 text-primary" />
                            )}
                          </div>
                        </div>
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Selected Brands Display */}
        {selectedCount > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Selected Brands:
            </p>
            <div className="flex flex-wrap gap-1">
              {selectedBrands.map((brand) => (
                <Badge
                  key={brand}
                  variant="secondary"
                  className="flex items-center gap-1 pr-1"
                >
                  <span>{brand}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0.5 hover:bg-transparent hover:text-destructive"
                    onClick={() => handleBrandToggle(brand)}
                    aria-label={`Remove ${brand}`}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 