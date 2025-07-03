"use client"

import * as React from "react"
import {
  AlertTriangle,
  Building2,
  Home,
  Package,
  Search,
  Settings,
  TrendingDown,
  TrendingUp,
  Users,
  Plus,
  Edit,
  Trash2,
  ChevronDown,
  ChevronRight,
  Star,
  TrendingUpIcon,
  LogOut,
  UserCircle,
} from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Mock data for stores and inventory
const stores = [
  {
    id: 1,
    name: "TYLER'S",
    location: "Main Street, Downtown",
    totalItems: 1250,
    lowStockItems: 8,
    outOfStock: 2,
    inventoryHealth: 85,
  },
  {
    id: 2,
    name: "Racquet & Jog",
    location: "Shopping Center, North",
    totalItems: 980,
    lowStockItems: 12,
    outOfStock: 1,
    inventoryHealth: 78,
  },
  {
    id: 3,
    name: "Whole Earth Provision Co.",
    location: "Airport Terminal",
    totalItems: 650,
    lowStockItems: 5,
    outOfStock: 0,
    inventoryHealth: 92,
  },
  {
    id: 4,
    name: "Sun & Ski Sports",
    location: "Industrial District",
    totalItems: 3200,
    lowStockItems: 25,
    outOfStock: 8,
    inventoryHealth: 72,
  },
  {
    id: 5,
    name: "Cavender's",
    location: "West Side Plaza",
    totalItems: 1450,
    lowStockItems: 15,
    outOfStock: 3,
    inventoryHealth: 80,
  },
  {
    id: 6,
    name: "Lone Star Dry Goods",
    location: "Historic District",
    totalItems: 890,
    lowStockItems: 6,
    outOfStock: 1,
    inventoryHealth: 88,
  },
  {
    id: 7,
    name: "Atwoods Ranch & Home",
    location: "Rural Highway",
    totalItems: 2100,
    lowStockItems: 18,
    outOfStock: 4,
    inventoryHealth: 75,
  },
  {
    id: 8,
    name: "SCHEELS (The Colony)",
    location: "The Colony Mall",
    totalItems: 1800,
    lowStockItems: 10,
    outOfStock: 2,
    inventoryHealth: 86,
  },
  {
    id: 9,
    name: "Buckle",
    location: "Fashion Center",
    totalItems: 750,
    lowStockItems: 8,
    outOfStock: 0,
    inventoryHealth: 90,
  },
  {
    id: 10,
    name: "Wild West Boot Store",
    location: "Cowboy District",
    totalItems: 1100,
    lowStockItems: 12,
    outOfStock: 2,
    inventoryHealth: 82,
  },
]

const lowStockAlerts = [
  {
    id: 1,
    store: "TYLER'S",
    item: "Sendero Logo Baseball Cap",
    currentStock: 3,
    minStock: 20,
    severity: "high",
  },
  {
    id: 2,
    store: "Racquet & Jog",
    item: "Sendero Performance T-Shirt",
    currentStock: 8,
    minStock: 15,
    severity: "medium",
  },
  {
    id: 3,
    store: "Sun & Ski Sports",
    item: "Sendero Hoodie - Navy",
    currentStock: 5,
    minStock: 12,
    severity: "high",
  },
  {
    id: 4,
    store: "Cavender's",
    item: "Sendero Trucker Hat",
    currentStock: 7,
    minStock: 18,
    severity: "medium",
  },
  {
    id: 5,
    store: "SCHEELS (The Colony)",
    item: "Sendero Long Sleeve Tee",
    currentStock: 4,
    minStock: 15,
    severity: "high",
  },
]

// Mock inventory data
const inventoryItems = [
  { id: 1, sku: "SND-CAP-001", name: "Sendero Logo Baseball Cap", category: "Headwear", totalStock: 245, price: 24.99 },
  {
    id: 2,
    sku: "SND-TEE-001",
    name: "Sendero Performance T-Shirt",
    category: "Apparel",
    totalStock: 180,
    price: 19.99,
  },
  { id: 3, sku: "SND-HOD-001", name: "Sendero Hoodie - Navy", category: "Apparel", totalStock: 95, price: 49.99 },
  { id: 4, sku: "SND-HAT-001", name: "Sendero Trucker Hat", category: "Headwear", totalStock: 156, price: 22.99 },
  { id: 5, sku: "SND-LST-001", name: "Sendero Long Sleeve Tee", category: "Apparel", totalStock: 120, price: 29.99 },
  { id: 6, sku: "SND-JAK-001", name: "Sendero Windbreaker", category: "Outerwear", totalStock: 78, price: 69.99 },
  { id: 7, sku: "SND-SHT-001", name: "Sendero Polo Shirt", category: "Apparel", totalStock: 203, price: 34.99 },
  { id: 8, sku: "SND-BEA-001", name: "Sendero Beanie", category: "Headwear", totalStock: 167, price: 16.99 },
]

// Mock reports data - TODO: Connect to real API
// const reportsData = [
//   { id: 1, name: "Monthly Inventory Report", type: "Inventory", date: "2024-01-15", status: "Completed" },
//   { id: 2, name: "Low Stock Analysis", type: "Analysis", date: "2024-01-14", status: "Completed" },
//   { id: 3, name: "Sales Performance Report", type: "Sales", date: "2024-01-13", status: "In Progress" },
//   { id: 4, name: "Store Comparison Report", type: "Comparison", date: "2024-01-12", status: "Completed" },
// ]

// Mock users data - TODO: Connect to real API
// const usersData = [
//   {
//     id: 1,
//     name: "John Smith",
//     email: "john.smith@sendero.com",
//     role: "Admin",
//     status: "Active",
//     lastLogin: "2024-01-15",
//   },
//   {
//     id: 2,
//     name: "Sarah Johnson",
//     email: "sarah.johnson@sendero.com",
//     role: "Manager",
//     status: "Active",
//     lastLogin: "2024-01-15",
//   },
//   {
//     id: 3,
//     name: "Mike Davis",
//     email: "mike.davis@sendero.com",
//     role: "Buyer",
//     status: "Active",
//     lastLogin: "2024-01-14",
//   },
//   {
//     id: 4,
//     name: "Lisa Wilson",
//     email: "lisa.wilson@sendero.com",
//     role: "Analyst",
//     status: "Inactive",
//     lastLogin: "2024-01-10",
//   },
// ]

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

const navigationItems = [
  {
    title: "Overview",
    icon: Home,
    view: "overview",
    isActive: false,
  },
  {
    title: "Stores",
    icon: Building2,
    view: "stores",
    isActive: false,
  },
  {
    title: "Inventory",
    icon: Package,
    view: "inventory",
    isActive: false,
  },
  {
    title: "Reports",
    icon: TrendingUp,
    view: "reports",
    isActive: false,
  },
  {
    title: "Users",
    icon: Users,
    view: "users",
    isActive: false,
  },
  {
    title: "Settings",
    icon: Settings,
    view: "settings",
    isActive: false,
  },
]

function TopSellersSection() {
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

function AppSidebar({ currentView, onNavigate }: { currentView: string; onNavigate: (view: string) => void }) {
  const updatedNavigationItems = navigationItems.map((item) => ({
    ...item,
    isActive: currentView === item.view,
  }))

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-600 to-slate-800 text-white">
            <span className="text-lg font-bold">RO</span>
          </div>
          <div className="flex flex-col">
            <span className="font-semibold">RepOrder</span>
            <span className="text-xs text-muted-foreground">Inventory System</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {updatedNavigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={item.isActive}>
                    <button onClick={() => onNavigate(item.view)}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            System Online
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

export default function InventoryDashboard() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [currentView, setCurrentView] = React.useState("overview")

  const filteredStores = stores.filter(
    (store) =>
      store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.location.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredInventory = inventoryItems.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const totalItems = stores.reduce((sum, store) => sum + store.totalItems, 0)
  const totalLowStock = stores.reduce((sum, store) => sum + store.lowStockItems, 0)
  const totalOutOfStock = stores.reduce((sum, store) => sum + store.outOfStock, 0)

  const handleNavigation = (view: string) => {
    setCurrentView(view)
    setSearchQuery("") // Reset search when changing views
  }

  return (
    <SidebarProvider>
      <AppSidebar currentView={currentView} onNavigate={handleNavigation} />
      <SidebarInset>
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex flex-1 items-center gap-4">
            <h1 className="font-semibold">Sendero Inventory Dashboard</h1>
            <div className="ml-auto flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 w-8 rounded-full p-0 bg-transparent">
                    <span className="text-xs font-medium">HG</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <UserCircle className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex flex-1 flex-col gap-4 p-4">
          {/* Top Sellers Section - Always visible at the top */}
          <TopSellersSection />

          {currentView === "overview" && (
            <>
              {/* Overview Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Items</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalItems.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                      <TrendingUp className="inline h-3 w-3" /> +2.5% from last month
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-yellow-600">{totalLowStock}</div>
                    <p className="text-xs text-muted-foreground">Requires attention</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">{totalOutOfStock}</div>
                    <p className="text-xs text-muted-foreground">Immediate action needed</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Stores</CardTitle>
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stores.length}</div>
                    <p className="text-xs text-muted-foreground">All operational</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                {/* Store Inventory List */}
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Store Inventory Levels</CardTitle>
                          <CardDescription>Monitor inventory health across all locations</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="Search stores..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="pl-8 w-64"
                            />
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Store</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Total Items</TableHead>
                            <TableHead>Health</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredStores.map((store) => (
                            <TableRow key={store.id}>
                              <TableCell className="font-medium">{store.name}</TableCell>
                              <TableCell className="text-muted-foreground">{store.location}</TableCell>
                              <TableCell>{store.totalItems.toLocaleString()}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Progress value={store.inventoryHealth} className="w-16" />
                                  <span className="text-sm">{store.inventoryHealth}%</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    store.inventoryHealth >= 90
                                      ? "default"
                                      : store.inventoryHealth >= 75
                                        ? "secondary"
                                        : "destructive"
                                  }
                                >
                                  {store.inventoryHealth >= 90
                                    ? "Excellent"
                                    : store.inventoryHealth >= 75
                                      ? "Good"
                                      : "Needs Attention"}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>

                {/* Notification Panel */}
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                        Low Stock Alerts
                      </CardTitle>
                      <CardDescription>Items requiring immediate attention</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {lowStockAlerts.map((alert) => (
                        <Alert
                          key={alert.id}
                          className={alert.severity === "high" ? "border-red-200" : "border-yellow-200"}
                        >
                          <div className="flex items-start justify-between w-full">
                            <div className="flex items-start gap-2">
                              <AlertTriangle className="h-4 w-4 mt-0.5" />
                              <div className="flex-1">
                                <AlertTitle className="text-sm">{alert.item}</AlertTitle>
                                <AlertDescription className="text-xs">
                                  <div className="mt-1">
                                    <div className="font-medium">{alert.store}</div>
                                    <div className="text-muted-foreground">
                                      Current: {alert.currentStock} | Min: {alert.minStock}
                                    </div>
                                  </div>
                                </AlertDescription>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="ml-2 h-8 px-3 text-xs bg-transparent"
                              onClick={() => {
                                console.log(`Notifying buyer for ${alert.item} at ${alert.store}`)
                              }}
                            >
                              Notify Buyer
                            </Button>
                          </div>
                        </Alert>
                      ))}
                      <Button variant="outline" className="w-full bg-transparent" size="sm">
                        View All Alerts
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Quick Actions */}
                  <Card className="mt-4">
                    <CardHeader>
                      <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button variant="outline" className="w-full justify-start bg-transparent" size="sm">
                        <Package className="mr-2 h-4 w-4" />
                        Add New Item
                      </Button>
                      <Button variant="outline" className="w-full justify-start bg-transparent" size="sm">
                        <Building2 className="mr-2 h-4 w-4" />
                        Manage Stores
                      </Button>
                      <Button variant="outline" className="w-full justify-start bg-transparent" size="sm">
                        <TrendingUp className="mr-2 h-4 w-4" />
                        Generate Report
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </>
          )}

          {currentView === "stores" && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>All Stores</CardTitle>
                    <CardDescription>Complete list of store locations and inventory status</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search stores..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8 w-64"
                      />
                    </div>
                    <Button size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Store
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Store</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Total Items</TableHead>
                      <TableHead>Low Stock</TableHead>
                      <TableHead>Out of Stock</TableHead>
                      <TableHead>Health</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStores.map((store) => (
                      <TableRow key={store.id}>
                        <TableCell className="font-medium">{store.name}</TableCell>
                        <TableCell className="text-muted-foreground">{store.location}</TableCell>
                        <TableCell>{store.totalItems.toLocaleString()}</TableCell>
                        <TableCell className="text-yellow-600">{store.lowStockItems}</TableCell>
                        <TableCell className="text-red-600">{store.outOfStock}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={store.inventoryHealth} className="w-16" />
                            <span className="text-sm">{store.inventoryHealth}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              store.inventoryHealth >= 90
                                ? "default"
                                : store.inventoryHealth >= 75
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {store.inventoryHealth >= 90
                              ? "Excellent"
                              : store.inventoryHealth >= 75
                                ? "Good"
                                : "Needs Attention"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {currentView === "inventory" && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Inventory Management</CardTitle>
                    <CardDescription>Manage all Sendero merchandise inventory</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search inventory..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8 w-64"
                      />
                    </div>
                    <Button size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Item
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>SKU</TableHead>
                      <TableHead>Product Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Total Stock</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInventory.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>{item.totalStock}</TableCell>
                        <TableCell>${item.price}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              item.totalStock > 100 ? "default" : item.totalStock > 50 ? "secondary" : "destructive"
                            }
                          >
                            {item.totalStock > 100 ? "In Stock" : item.totalStock > 50 ? "Low Stock" : "Critical"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
