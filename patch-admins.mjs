import fs from 'fs';

const filePath = 'app/[lang]/super-admin/admins/AdminsClient.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Add institutions to the props
content = content.replace(
  `export function AdminsClient({ initialAdmins }: { initialAdmins: AdminRow[] }) {`,
  `export function AdminsClient({ initialAdmins, institutions }: { initialAdmins: AdminRow[], institutions: {id: string, name: string}[] }) {`
);

// Add state for institution_id
content = content.replace(
  `const [role, setRole] = useState<'nazim' | 'admin'>('nazim')`,
  `const [role, setRole] = useState<'nazim' | 'admin'>('nazim')\n  const [institutionId, setInstitutionId] = useState(institutions[0]?.id || '')`
);

// Append institution_id to formData
content = content.replace(
  `formData.append('role', role)`,
  `formData.append('role', role)\n    formData.append('institution_id', institutionId)`
);

// Add the dropdown in the form
const formDropdown = `
              <div className="space-y-1.5">
                <Label htmlFor="inst" className="text-xs font-semibold">Assign to Jamia (Institution)</Label>
                <select
                  id="inst"
                  value={institutionId}
                  onChange={(e) => setInstitutionId(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm font-medium"
                >
                  {institutions.map(inst => (
                    <option key={inst.id} value={inst.id}>{inst.name}</option>
                  ))}
                </select>
              </div>
`;

content = content.replace(
  `<div className="space-y-1.5">
                <Label htmlFor="nen" className="text-xs font-semibold">Full Name (English)</Label>`,
  formDropdown + `\n              <div className="space-y-1.5">
                <Label htmlFor="nen" className="text-xs font-semibold">Full Name (English)</Label>`
);

fs.writeFileSync(filePath, content);
console.log('Successfully patched AdminsClient.tsx');
