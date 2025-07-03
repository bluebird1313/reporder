'use client'

import React from 'react'
import { Star, ChevronDown, ChevronRight, TrendingUpIcon } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

// Top sellers data by channel and category
const topSellersData = {
  western: {
    hats: [
      { rank: 1, style: "Rodeo King", color: "Black", sku: "RK-001-BLK", units: 1247, revenue: 31175 },
      { rank: 2, style: "Cowboy Classic", color: "Brown", sku: "CC-002-BRN", units: 892, revenue: 22300 },
      { rank: 3, style: "Ranch Hand", color: "Tan", sku: "RH-003-TAN", units: 756, revenue: 18900 },
      { rank: 4, style: "Frontier", color: "Navy", sku: "FR-004-NVY", units: 634, revenue: 15850 },
      { rank: 5, style: "Wrangler", color: "Grey", sku: "WR-005-GRY", units: 523, revenue: 13075 },
    ],
    "T's": [
      { rank: 1, style: "Bronco Rider", color: "Heather Grey", sku: "BR-101-HGY", units: 2134, revenue: 42680 },
      { rank: 2, style: "Wild West", color: "Black", sku: "WW-102-BLK", units: 1876, revenue: 37520 },
      { rank: 3, style: "Saddle Up", color: "White", sku: "SU-103-WHT", units: 1654, revenue: 33080 },
      { rank: 4, style: "Cowpoke", color: "Red", sku: "CP-104-RED", units: 1432, revenue: 28640 },
      { rank: 5, style: "Rustler", color: "Navy", sku: "RS-105-NVY", units: 1298, revenue: 25960 },
    ],
    wovens: [
      { rank: 1, style: "Prairie Shirt", color: "Blue Plaid", sku: "PS-201-BPL", units: 987, revenue: 49350 },
      { rank: 2, style: "Rancher", color: "Red Check", sku: "RC-202-RCK", units: 834, revenue: 41700 },
      { rank: 3, style: "Outlaw", color: "Black Solid", sku: "OL-203-BSL", units: 723, revenue: 36150 },
      { rank: 4, style: "Maverick", color: "Green Plaid", sku: "MV-204-GPL", units: 656, revenue: 32800 },
      { rank: 5, style: "Buckaroo", color: "Brown Check", sku: "BK-205-BCK", units: 589, revenue: 29450 },
    ],
    knits: [
      { rank: 1, style: "Rodeo Hoodie", color: "Charcoal", sku: "RH-301-CHR", units: 1456, revenue: 87360 },
      { rank: 2, style: "Western Pullover", color: "Maroon", sku: "WP-302-MAR", units: 1234, revenue: 74040 },
      { rank: 3, style: "Cowboy Crew", color: "Navy", sku: "CC-303-NVY", units: 1087, revenue: 65220 },
      { rank: 4, style: "Ranch Zip", color: "Forest", sku: "RZ-304-FOR", units: 923, revenue: 55380 },
      { rank: 5, style: "Frontier Fleece", color: "Grey", sku: "FF-305-GRY", units: 812, revenue: 48720 },
    ],
    pants: [
      { rank: 1, style: "Wrangler Jeans", color: "Dark Wash", sku: "WJ-401-DWS", units: 2345, revenue: 187600 },
      { rank: 2, style: "Cowboy Cut", color: "Medium Wash", sku: "CC-402-MWS", units: 1987, revenue: 158960 },
      { rank: 3, style: "Ranch Work", color: "Black", sku: "RW-403-BLK", units: 1654, revenue: 132320 },
      { rank: 4, style: "Rodeo Fit", color: "Light Wash", sku: "RF-404-LWS", units: 1432, revenue: 114560 },
      { rank: 5, style: "Western Boot", color: "Raw Denim", sku: "WB-405-RAW", units: 1298, revenue: 103840 },
    ],
    fleece: [
      { rank: 1, style: "Sherpa Vest", color: "Tan", sku: "SV-501-TAN", units: 876, revenue: 61320 },
      { rank: 2, style: "Ranch Jacket", color: "Brown", sku: "RJ-502-BRN", units: 743, revenue: 52010 },
      { rank: 3, style: "Cowboy Pullover", color: "Black", sku: "CP-503-BLK", units: 654, revenue: 45780 },
      { rank: 4, style: "Western Zip", color: "Navy", sku: "WZ-504-NVY", units: 567, revenue: 39690 },
      { rank: 5, style: "Frontier Fleece", color: "Grey", sku: "FF-505-GRY", units: 489, revenue: 34230 },
    ],
  },
  "alt sports": {
    hats: [
      { rank: 1, style: "Skate Cap", color: "Black", sku: "SC-001-BLK", units: 1876, revenue: 37520 },
      { rank: 2, style: "BMX Snapback", color: "Red", sku: "BS-002-RED", units: 1654, revenue: 33080 },
      { rank: 3, style: "Surf Beanie", color: "Blue", sku: "SB-003-BLU", units: 1432, revenue: 28640 },
      { rank: 4, style: "Street Trucker", color: "White", sku: "ST-004-WHT", units: 1298, revenue: 25960 },
      { rank: 5, style: "Urban Bucket", color: "Camo", sku: "UB-005-CAM", units: 1156, revenue: 23120 },
    ],
    "T's": [
      { rank: 1, style: "Skate Graphic", color: "Black", sku: "SG-101-BLK", units: 3456, revenue: 69120 },
      { rank: 2, style: "BMX Rider", color: "White", sku: "BR-102-WHT", units: 2987, revenue: 59740 },
      { rank: 3, style: "Surf Co.", color: "Blue", sku: "SC-103-BLU", units: 2654, revenue: 53080 },
      { rank: 4, style: "Street Art", color: "Grey", sku: "SA-104-GRY", units: 2432, revenue: 48640 },
      { rank: 5, style: "Urban Vibe", color: "Red", sku: "UV-105-RED", units: 2198, revenue: 43960 },
    ],
    wovens: [
      { rank: 1, style: "Skate Flannel", color: "Red Plaid", sku: "SF-201-RPL", units: 1234, revenue: 61700 },
      { rank: 2, style: "Street Shirt", color: "Black", sku: "SS-202-BLK", units: 1087, revenue: 54350 },
      { rank: 3, style: "Urban Button", color: "Navy", sku: "UB-203-NVY", units: 923, revenue: 46150 },
      { rank: 4, style: "BMX Work", color: "Grey", sku: "BW-204-GRY", units: 812, revenue: 40600 },
      { rank: 5, style: "Surf Casual", color: "Blue", sku: "SC-205-BLU", units: 734, revenue: 36700 },
    ],
    knits: [
      { rank: 1, style: "Skate Hoodie", color: "Black", sku: "SH-301-BLK", units: 2134, revenue: 128040 },
      { rank: 2, style: "Street Crew", color: "Grey", sku: "SC-302-GRY", units: 1876, revenue: 112560 },
      { rank: 3, style: "BMX Zip", color: "Red", sku: "BZ-303-RED", units: 1654, revenue: 99240 },
      { rank: 4, style: "Urban Pullover", color: "Navy", sku: "UP-304-NVY", units: 1432, revenue: 85920 },
      { rank: 5, style: "Surf Sweat", color: "Blue", sku: "SS-305-BLU", units: 1298, revenue: 77880 },
    ],
    pants: [
      { rank: 1, style: "Skate Jeans", color: "Black", sku: "SJ-401-BLK", units: 1987, revenue: 158960 },
      { rank: 2, style: "Street Cargo", color: "Khaki", sku: "SC-402-KHK", units: 1765, revenue: 141200 },
      { rank: 3, style: "BMX Shorts", color: "Grey", sku: "BS-403-GRY", units: 1543, revenue: 123440 },
      { rank: 4, style: "Urban Chino", color: "Navy", sku: "UC-404-NVY", units: 1321, revenue: 105680 },
      { rank: 5, style: "Surf Board", color: "Blue", sku: "SB-405-BLU", units: 1199, revenue: 95920 },
    ],
    fleece: [
      { rank: 1, style: "Skate Sherpa", color: "Black", sku: "SS-501-BLK", units: 1456, revenue: 101920 },
      { rank: 2, style: "Street Fleece", color: "Grey", sku: "SF-502-GRY", units: 1234, revenue: 86380 },
      { rank: 3, style: "BMX Jacket", color: "Red", sku: "BJ-503-RED", units: 1087, revenue: 76090 },
      { rank: 4, style: "Urban Vest", color: "Navy", sku: "UV-504-NVY", units: 923, revenue: 64610 },
      { rank: 5, style: "Surf Zip", color: "Blue", sku: "SZ-505-BLU", units: 812, revenue: 56840 },
    ],
  },
  fashion: {
    hats: [
      { rank: 1, style: "Designer Cap", color: "Black", sku: "DC-001-BLK", units: 2134, revenue: 64020 },
      { rank: 2, style: "Fashion Beret", color: "Burgundy", sku: "FB-002-BUR", units: 1876, revenue: 56280 },
      { rank: 3, style: "Trendy Bucket", color: "Cream", sku: "TB-003-CRM", units: 1654, revenue: 49620 },
      { rank: 4, style: "Chic Fedora", color: "Tan", sku: "CF-004-TAN", units: 1432, revenue: 42960 },
      { rank: 5, style: "Style Snapback", color: "White", sku: "SS-005-WHT", units: 1298, revenue: 38940 },
    ],
    "T's": [
      { rank: 1, style: "Fashion Tee", color: "Black", sku: "FT-101-BLK", units: 4321, revenue: 129630 },
      { rank: 2, style: "Designer Basic", color: "White", sku: "DB-102-WHT", units: 3987, revenue: 119610 },
      { rank: 3, style: "Trendy Crop", color: "Pink", sku: "TC-103-PNK", units: 3654, revenue: 109620 },
      { rank: 4, style: "Chic Graphic", color: "Grey", sku: "CG-104-GRY", units: 3432, revenue: 102960 },
      { rank: 5, style: "Style Statement", color: "Navy", sku: "SS-105-NVY", units: 3198, revenue: 95940 },
    ],
    wovens: [
      { rank: 1, style: "Designer Blouse", color: "Silk White", sku: "DB-201-SWH", units: 1654, revenue: 132320 },
      { rank: 2, style: "Fashion Shirt", color: "Powder Blue", sku: "FS-202-PBL", units: 1432, revenue: 114560 },
      { rank: 3, style: "Trendy Button", color: "Rose Gold", sku: "TB-203-RGD", units: 1298, revenue: 103840 },
      { rank: 4, style: "Chic Wrap", color: "Black", sku: "CW-204-BLK", units: 1156, revenue: 92480 },
      { rank: 5, style: "Style Classic", color: "Navy", sku: "SC-205-NVY", units: 1034, revenue: 82720 },
    ],
    knits: [
      { rank: 1, style: "Designer Sweater", color: "Cashmere", sku: "DS-301-CSH", units: 1876, revenue: 187600 },
      { rank: 2, style: "Fashion Cardigan", color: "Cream", sku: "FC-302-CRM", units: 1654, revenue: 165400 },
      { rank: 3, style: "Trendy Pullover", color: "Blush", sku: "TP-303-BLS", units: 1432, revenue: 143200 },
      { rank: 4, style: "Chic Hoodie", color: "Grey", sku: "CH-304-GRY", units: 1298, revenue: 129800 },
      { rank: 5, style: "Style Knit", color: "Black", sku: "SK-305-BLK", units: 1156, revenue: 115600 },
    ],
    pants: [
      { rank: 1, style: "Designer Jeans", color: "Dark Indigo", sku: "DJ-401-DIN", units: 2987, revenue: 358440 },
      { rank: 2, style: "Fashion Leggings", color: "Black", sku: "FL-402-BLK", units: 2654, revenue: 212320 },
      { rank: 3, style: "Trendy Trousers", color: "Navy", sku: "TT-403-NVY", units: 2432, revenue: 243200 },
      { rank: 4, style: "Chic Palazzo", color: "Cream", sku: "CP-404-CRM", units: 2198, revenue: 175840 },
      { rank: 5, style: "Style Skinny", color: "Grey", sku: "SS-405-GRY", units: 1987, revenue: 238440 },
    ],
    fleece: [
      { rank: 1, style: "Designer Coat", color: "Camel", sku: "DC-501-CAM", units: 1234, revenue: 148080 },
      { rank: 2, style: "Fashion Jacket", color: "Black", sku: "FJ-502-BLK", units: 1087, revenue: 130440 },
      { rank: 3, style: "Trendy Vest", color: "White", sku: "TV-503-WHT", units: 923, revenue: 110760 },
      { rank: 4, style: "Chic Wrap", color: "Grey", sku: "CW-504-GRY", units: 812, revenue: 97440 },
      { rank: 5, style: "Style Fleece", color: "Navy", sku: "SF-505-NVY", units: 734, revenue: 88080 },
    ],
  },
  outdoors: {
    hats: [
      { rank: 1, style: "Trail Cap", color: "Olive", sku: "TC-001-OLV", units: 1987, revenue: 39740 },
      { rank: 2, style: "Hiking Beanie", color: "Forest", sku: "HB-002-FOR", units: 1765, revenue: 35300 },
      { rank: 3, style: "Adventure Hat", color: "Khaki", sku: "AH-003-KHK", units: 1543, revenue: 30860 },
      { rank: 4, style: "Explorer Cap", color: "Brown", sku: "EC-004-BRN", units: 1321, revenue: 26420 },
      { rank: 5, style: "Summit Beanie", color: "Grey", sku: "SB-005-GRY", units: 1199, revenue: 23980 },
    ],
    "T's": [
      { rank: 1, style: "Trail Runner", color: "Forest Green", sku: "TR-101-FGR", units: 2987, revenue: 59740 },
      { rank: 2, style: "Hiking Tee", color: "Stone", sku: "HT-102-STN", units: 2654, revenue: 53080 },
      { rank: 3, style: "Adventure Shirt", color: "Khaki", sku: "AS-103-KHK", units: 2432, revenue: 48640 },
      { rank: 4, style: "Explorer Tee", color: "Navy", sku: "ET-104-NVY", units: 2198, revenue: 43960 },
      { rank: 5, style: "Summit Shirt", color: "Grey", sku: "SS-105-GRY", units: 1987, revenue: 39740 },
    ],
    wovens: [
      { rank: 1, style: "Trail Shirt", color: "Olive Plaid", sku: "TS-201-OPL", units: 1456, revenue: 72800 },
      { rank: 2, style: "Hiking Button", color: "Khaki", sku: "HB-202-KHK", units: 1234, revenue: 61700 },
      { rank: 3, style: "Adventure Work", color: "Forest", sku: "AW-203-FOR", units: 1087, revenue: 54350 },
      { rank: 4, style: "Explorer Flannel", color: "Red Check", sku: "EF-204-RCK", units: 923, revenue: 46150 },
      { rank: 5, style: "Summit Casual", color: "Blue", sku: "SC-205-BLU", units: 812, revenue: 40600 },
    ],
    knits: [
      { rank: 1, style: "Trail Fleece", color: "Forest", sku: "TF-301-FOR", units: 1876, revenue: 112560 },
      { rank: 2, style: "Hiking Hoodie", color: "Stone", sku: "HH-302-STN", units: 1654, revenue: 99240 },
      { rank: 3, style: "Adventure Zip", color: "Olive", sku: "AZ-303-OLV", units: 1432, revenue: 85920 },
      { rank: 4, style: "Explorer Crew", color: "Navy", sku: "EC-304-NVY", units: 1298, revenue: 77880 },
      { rank: 5, style: "Summit Pullover", color: "Grey", sku: "SP-305-GRY", units: 1156, revenue: 69360 },
    ],
    pants: [
      { rank: 1, style: "Trail Pants", color: "Khaki", sku: "TP-401-KHK", units: 2134, revenue: 170720 },
      { rank: 2, style: "Hiking Shorts", color: "Olive", sku: "HS-402-OLV", units: 1876, revenue: 150080 },
      { rank: 3, style: "Adventure Cargo", color: "Stone", sku: "AC-403-STN", units: 1654, revenue: 132320 },
      { rank: 4, style: "Explorer Jeans", color: "Dark Wash", sku: "EJ-404-DWS", units: 1432, revenue: 114560 },
      { rank: 5, style: "Summit Chino", color: "Navy", sku: "SC-405-NVY", units: 1298, revenue: 103840 },
    ],
    fleece: [
      { rank: 1, style: "Trail Jacket", color: "Forest", sku: "TJ-501-FOR", units: 1654, revenue: 115780 },
      { rank: 2, style: "Hiking Vest", color: "Olive", sku: "HV-502-OLV", units: 1432, revenue: 100240 },
      { rank: 3, style: "Adventure Fleece", color: "Stone", sku: "AF-503-STN", units: 1298, revenue: 90860 },
      { rank: 4, style: "Explorer Zip", color: "Navy", sku: "EZ-504-NVY", units: 1156, revenue: 80920 },
      { rank: 5, style: "Summit Sherpa", color: "Grey", sku: "SS-505-GRY", units: 1034, revenue: 72380 },
    ],
  },
  resort: {
    hats: [
      { rank: 1, style: "Beach Cap", color: "White", sku: "BC-001-WHT", units: 2654, revenue: 53080 },
      { rank: 2, style: "Resort Visor", color: "Pink", sku: "RV-002-PNK", units: 2432, revenue: 48640 },
      { rank: 3, style: "Vacation Hat", color: "Coral", sku: "VH-003-COR", units: 2198, revenue: 43960 },
      { rank: 4, style: "Tropical Bucket", color: "Turquoise", sku: "TB-004-TUR", units: 1987, revenue: 39740 },
      { rank: 5, style: "Paradise Cap", color: "Yellow", sku: "PC-005-YEL", units: 1765, revenue: 35300 },
    ],
    "T's": [
      { rank: 1, style: "Beach Tee", color: "Ocean Blue", sku: "BT-101-OBL", units: 3987, revenue: 79740 },
      { rank: 2, style: "Resort Shirt", color: "Coral", sku: "RS-102-COR", units: 3654, revenue: 73080 },
      { rank: 3, style: "Vacation Tee", color: "Sunset", sku: "VT-103-SUN", units: 3432, revenue: 68640 },
      { rank: 4, style: "Tropical Shirt", color: "Palm Green", sku: "TS-104-PGR", units: 3198, revenue: 63960 },
      { rank: 5, style: "Paradise Tee", color: "White", sku: "PT-105-WHT", units: 2987, revenue: 59740 },
    ],
    wovens: [
      { rank: 1, style: "Beach Shirt", color: "Linen White", sku: "BS-201-LWH", units: 1876, revenue: 93800 },
      { rank: 2, style: "Resort Button", color: "Sky Blue", sku: "RB-202-SBL", units: 1654, revenue: 82700 },
      { rank: 3, style: "Vacation Blouse", color: "Coral", sku: "VB-203-COR", units: 1432, revenue: 71600 },
      { rank: 4, style: "Tropical Shirt", color: "Palm Print", sku: "TS-204-PPR", units: 1298, revenue: 64900 },
      { rank: 5, style: "Paradise Button", color: "Sunset", sku: "PB-205-SUN", units: 1156, revenue: 57800 },
    ],
    knits: [
      { rank: 1, style: "Beach Hoodie", color: "Ocean", sku: "BH-301-OCN", units: 2134, revenue: 128040 },
      { rank: 2, style: "Resort Cardigan", color: "Coral", sku: "RC-302-COR", units: 1876, revenue: 112560 },
      { rank: 3, style: "Vacation Pullover", color: "Sunset", sku: "VP-303-SUN", units: 1654, revenue: 99240 },
      { rank: 4, style: "Tropical Zip", color: "Palm", sku: "TZ-304-PAL", units: 1432, revenue: 85920 },
      { rank: 5, style: "Paradise Crew", color: "White", sku: "PC-305-WHT", units: 1298, revenue: 77880 },
    ],
    pants: [
      { rank: 1, style: "Beach Shorts", color: "Coral", sku: "BS-401-COR", units: 3456, revenue: 207360 },
      { rank: 2, style: "Resort Linen", color: "White", sku: "RL-402-WHT", units: 2987, revenue: 238960 },
      { rank: 3, style: "Vacation Capri", color: "Ocean", sku: "VC-403-OCN", units: 2654, revenue: 159240 },
      { rank: 4, style: "Tropical Swim", color: "Sunset", sku: "TS-404-SUN", units: 2432, revenue: 121600 },
      { rank: 5, style: "Paradise Pants", color: "Palm", sku: "PP-405-PAL", units: 2198, revenue: 175840 },
    ],
    fleece: [
      { rank: 1, style: "Beach Jacket", color: "White", sku: "BJ-501-WHT", units: 1456, revenue: 101920 },
      { rank: 2, style: "Resort Wrap", color: "Coral", sku: "RW-502-COR", units: 1234, revenue: 86380 },
      { rank: 3, style: "Vacation Vest", color: "Ocean", sku: "VV-503-OCN", units: 1087, revenue: 76090 },
      { rank: 4, style: "Tropical Zip", color: "Sunset", sku: "TZ-504-SUN", units: 923, revenue: 64610 },
      { rank: 5, style: "Paradise Fleece", color: "Palm", sku: "PF-505-PAL", units: 812, revenue: 56840 },
    ],
  },
}

const channels = ["western", "alt sports", "fashion", "outdoors", "resort"]
const categories = ["hats", "T's", "wovens", "knits", "pants", "fleece"]

export function TopSellersSection() {
  const [expandedChannel, setExpandedChannel] = React.useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null)

  const handleChannelClick = (channel: string) => {
    if (expandedChannel === channel) {
      setExpandedChannel(null)
      setSelectedCategory(null)
    } else {
      setExpandedChannel(channel)
      setSelectedCategory(null)
    }
  }

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category)
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500" />
          Top Sellers by Channel
        </CardTitle>
        <CardDescription>Performance metrics across all retail channels</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2 mb-4">
            {channels.map((channel) => (
              <Button
                key={channel}
                variant={expandedChannel === channel ? "default" : "outline"}
                size="sm"
                onClick={() => handleChannelClick(channel)}
                className="capitalize flex items-center gap-2"
              >
                <div className="h-2 w-2 rounded-full bg-current" />
                {channel}
                {expandedChannel === channel ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </Button>
            ))}
          </div>

          {expandedChannel && (
            <div className="border rounded-lg">
              <div className="border-t bg-muted/20">
                <div className="p-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 mb-4">
                    {categories.map((category) => (
                      <Button
                        key={category}
                        variant={selectedCategory === category ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleCategoryClick(category)}
                        className="capitalize"
                      >
                        {category}
                      </Button>
                    ))}
                  </div>

                  {selectedCategory && (
                    <div className="mt-4">
                      <h4 className="font-semibold mb-3 capitalize">
                        Top {selectedCategory} - {expandedChannel}
                      </h4>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-12">Rank</TableHead>
                              <TableHead>Style</TableHead>
                              <TableHead>Color</TableHead>
                              <TableHead>SKU</TableHead>
                              <TableHead className="text-right">Units Sold</TableHead>
                              <TableHead className="text-right">Revenue</TableHead>
                              <TableHead className="text-right">Trend</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {topSellersData[expandedChannel as keyof typeof topSellersData][
                              selectedCategory as keyof (typeof topSellersData)[keyof typeof topSellersData]
                            ].map((item) => (
                              <TableRow key={item.sku}>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Badge
                                      variant={item.rank === 1 ? "default" : item.rank <= 3 ? "secondary" : "outline"}
                                      className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs"
                                    >
                                      {item.rank}
                                    </Badge>
                                  </div>
                                </TableCell>
                                <TableCell className="font-medium">{item.style}</TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded-full border border-muted-foreground/20 bg-gradient-to-r from-slate-200 to-slate-300" />
                                    {item.color}
                                  </div>
                                </TableCell>
                                <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                                <TableCell className="text-right font-medium">{item.units.toLocaleString()}</TableCell>
                                <TableCell className="text-right font-medium text-green-600">
                                  ${item.revenue.toLocaleString()}
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex items-center justify-end gap-1">
                                    <TrendingUpIcon className="h-4 w-4 text-green-500" />
                                    <span className="text-sm text-green-600">
                                      +{Math.floor(Math.random() * 15) + 5}%
                                    </span>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 