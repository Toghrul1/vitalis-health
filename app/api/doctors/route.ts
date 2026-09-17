import { doctors } from '@/lib/doctors';
export async function GET(request: Request) {
 const params = new URL(request.url).searchParams;
 const q = (params.get('q') || '').trim().toLowerCase();
 const specialty = params.get('specialty');
 return Response.json({doctors:doctors.filter(d=>(!specialty || specialty==='All specialties' || d.specialty===specialty) && `${d.name} ${d.specialty}`.toLowerCase().includes(q))});
}
