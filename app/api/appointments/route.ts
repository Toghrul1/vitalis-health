import { z } from 'zod';
import { randomUUID } from 'node:crypto';
import { db } from '@/lib/db';
import { doctors, slots } from '@/lib/doctors';
export const runtime = 'nodejs';
const schema = z.object({doctorId:z.string().refine(id=>doctors.some(d=>d.id===id)),date:z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(value=>{const d=new Date(value+'T12:00:00Z');const today=new Date().toISOString().slice(0,10);const max=new Date(Date.now()+90*86400000).toISOString().slice(0,10);return !isNaN(d.getTime()) && d.toISOString().slice(0,10)===value && value>=today && value<=max}),time:z.enum(slots as [string,...string[]]),name:z.string().trim().min(2).max(100),email:z.email().max(254),visitType:z.enum(['In-person','Video visit'])});
export async function GET(request:Request) {
 const p=new URL(request.url).searchParams;
 if(!doctors.some(d=>d.id===p.get('doctorId')) || !/^\d{4}-\d{2}-\d{2}$/.test(p.get('date')||'')) return Response.json({error:'Choose a valid doctor and date.'},{status:400});
 const booked=db().prepare('SELECT time FROM appointments WHERE doctor_id=? AND date=?').all(p.get('doctorId')!,p.get('date')!) as {time:string}[];
 return Response.json({slots:slots.filter(s=>!booked.some(b=>b.time===s))});
}
export async function POST(request:Request) {
 const origin=request.headers.get('origin');
 if(origin && origin!==new URL(request.url).origin) return Response.json({error:'Request origin not permitted.'},{status:403});
 let body;try{body=await request.json()}catch{return Response.json({error:'Invalid JSON.'},{status:400})}
 const result=schema.safeParse(body);
 if(!result.success) return Response.json({error:'Please enter valid contact information, a doctor, and a date within the next 90 days.'},{status:400});
 const a=result.data;const id=randomUUID();
 try{db().prepare('INSERT INTO appointments (id,doctor_id,date,time,name,email,visit_type) VALUES (?,?,?,?,?,?,?)').run(id,a.doctorId,a.date,a.time,a.name,a.email,a.visitType);return Response.json({id,date:a.date,time:a.time,doctor:doctors.find(d=>d.id===a.doctorId)?.name},{status:201})}
 catch(e){if(String(e).includes('UNIQUE'))return Response.json({error:'That time was just booked. Please choose another slot.'},{status:409});console.error('Appointment storage failed');return Response.json({error:'Unable to save your appointment. Please try again.'},{status:500})}
}
