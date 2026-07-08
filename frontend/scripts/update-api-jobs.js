const fs = require('fs');
let content = fs.readFileSync('app/api/hr/jobs/route.ts', 'utf8');

const putMethod = `
export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const userId = request.cookies.get("user_id")?.value;
    if (!userId) return NextResponse.json({ message: "Oturum açılmamış." }, { status: 401 });

    const hrUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!hrUser || hrUser.role !== "HR" || !hrUser.companyId) {
      return NextResponse.json({ message: "Yetkisiz erişim." }, { status: 403 });
    }

    const { id, title, description, status } = await request.json();
    if (!id) return NextResponse.json({ message: "İlan ID eksik." }, { status: 400 });

    const job = await prisma.jobPosting.findUnique({ where: { id } });
    if (!job) return NextResponse.json({ message: "İlan bulunamadı." }, { status: 404 });
    if (job.companyId !== hrUser.companyId) return NextResponse.json({ message: "Yetkisiz erişim." }, { status: 403 });

    const dataToUpdate: any = {};
    if (title) dataToUpdate.title = title;
    if (description) dataToUpdate.description = description;
    if (status) dataToUpdate.status = status;

    const updatedJob = await prisma.jobPosting.update({
      where: { id },
      data: dataToUpdate
    });

    return NextResponse.json(updatedJob, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Sunucu hatası." }, { status: 500 });
  }
}
`;

content += putMethod;
fs.writeFileSync('app/api/hr/jobs/route.ts', content);
