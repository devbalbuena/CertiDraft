import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Award, Download, Eye, Mail, Search, AlertCircle } from 'lucide-react'

// Note: This is a Server Component, so client-side filtering requires 
// URL search params or we just render it all. We'll do a basic version 
// here and we could enhance it with a client component for live search later.

export default async function CertificatesPage({
  searchParams
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/auth/login')

  const query = typeof searchParams.q === 'string' ? searchParams.q : ''
  const page = typeof searchParams.p === 'string' ? parseInt(searchParams.p) : 1
  const limit = 20
  const offset = (page - 1) * limit

  let dbQuery = supabase
    .from('certificates')
    .select('*, projects(name)', { count: 'exact' })
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (query) {
    dbQuery = dbQuery.or(`recipient_name.ilike.%${query}%,achievement.ilike.%${query}%`)
  }

  const { data: certificates, count } = await dbQuery.range(offset, offset + limit - 1)

  const totalPages = count ? Math.ceil(count / limit) : 1

  return (
    <div className="pb-12 max-w-6xl mx-auto">
      <PageHeader
        title="Certificates"
        subtitle="View and manage all your generated certificates."
      >
        <Link href="/dashboard">
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-10 px-6 rounded-lg shadow-sm">
            Generate New
          </Button>
        </Link>
      </PageHeader>

      {count === 0 && !query ? (
        <Card className="rounded-2xl border-dashed border-2 border-slate-200 bg-slate-50 flex flex-col items-center justify-center py-20 mt-8">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 mb-4">
            <Award className="h-8 w-8 text-indigo-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No certificates generated yet</h3>
          <p className="text-slate-500 text-sm max-w-md text-center mb-6">
            You haven't generated any certificates. Create a project and run a batch generation to see them here.
          </p>
          <Link href="/dashboard">
            <Button className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 font-semibold shadow-sm">
              Go to Dashboard
            </Button>
          </Link>
        </Card>
      ) : (
        <Card className="rounded-2xl border-slate-200 shadow-sm bg-white mt-8 overflow-hidden">
          
          {/* Toolbar */}
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50/50">
            <form className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                name="q"
                defaultValue={query}
                placeholder="Search recipient or achievement..." 
                className="pl-9 h-10 bg-white border-slate-200 focus-visible:ring-indigo-500 rounded-xl"
              />
            </form>
            <div className="text-sm font-medium text-slate-500">
              {count} total certificates
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-[11px]">Recipient</th>
                  <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-[11px]">Achievement</th>
                  <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-[11px]">Project</th>
                  <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-[11px]">Status</th>
                  <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-[11px]">Date</th>
                  <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-[11px] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {certificates?.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      No certificates found matching your search.
                    </td>
                  </tr>
                ) : (
                  certificates?.map((cert) => (
                    <tr key={cert.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4 font-bold text-slate-900">
                        {cert.recipient_name}
                      </td>
                      <td className="px-6 py-4 text-slate-600 truncate max-w-[200px]" title={cert.achievement}>
                        {cert.achievement}
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {Array.isArray(cert.projects) 
                          ? cert.projects[0]?.name 
                          : (cert.projects as any)?.name || 'Untitled'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100">
                          Issued
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-medium">
                        {new Date(cert.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link href={`/verify/${cert.id}`} target="_blank">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50" title="View Verification Page">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          {cert.pdf_url ? (
                            <Link href={cert.pdf_url} target="_blank">
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50" title="Download PDF">
                                <Download className="h-4 w-4" />
                              </Button>
                            </Link>
                          ) : (
                            <Button variant="ghost" size="icon" disabled className="h-8 w-8 text-slate-300" title="PDF not available">
                              <AlertCircle className="h-4 w-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50" title="Send Email">
                            <Mail className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-100 bg-white flex items-center justify-center gap-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <Link key={i} href={`/dashboard/certificates?p=${i + 1}${query ? `&q=${query}` : ''}`}>
                  <Button 
                    variant={page === i + 1 ? 'default' : 'outline'} 
                    size="sm"
                    className={page === i + 1 ? 'bg-indigo-600' : ''}
                  >
                    {i + 1}
                  </Button>
                </Link>
              ))}
            </div>
          )}

        </Card>
      )}
    </div>
  )
}
