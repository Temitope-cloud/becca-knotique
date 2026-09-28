import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin-auth";
import { connectToDatabase } from "@/lib/db";
import { DeliveryZone } from "@/lib/models/DeliveryZone";

const zone = z.object({ id: z.string().optional(), name: z.string().min(2).max(80), states: z.array(z.string().min(2).max(80)).max(40), cities: z.array(z.string().min(2).max(80)).max(100), fee: z.number().min(0), eta: z.string().max(80), active: z.boolean() });
export async function GET() { if (!(await getAdminSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); await connectToDatabase(); return NextResponse.json({ zones: await DeliveryZone.find().sort({ createdAt: 1 }).lean() }); }
export async function POST(request: Request) { if (!(await getAdminSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); const parsed=zone.safeParse(await request.json().catch(()=>({}))); if(!parsed.success) return NextResponse.json({error:"Check the delivery zone details."},{status:400}); await connectToDatabase(); const {id,...data}=parsed.data; const saved=id?await DeliveryZone.findByIdAndUpdate(id,data,{new:true}):await DeliveryZone.create(data); return NextResponse.json({zone:saved}); }
export async function DELETE(request: Request) { if (!(await getAdminSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); const id = new URL(request.url).searchParams.get("id"); if (!id || !z.string().safeParse(id).success) return NextResponse.json({ error: "Choose a delivery zone to delete." }, { status: 400 }); await connectToDatabase(); const deleted = await DeliveryZone.findByIdAndDelete(id); if (!deleted) return NextResponse.json({ error: "Delivery zone not found." }, { status: 404 }); return NextResponse.json({ ok: true }); }
