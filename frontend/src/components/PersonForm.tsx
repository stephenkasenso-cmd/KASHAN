import React, { useState, useEffect } from 'react';
import { UserPlus, AlertCircle } from 'lucide-react';

interface Person {
  person_id: number;
  first_name: string;
  last_name: string;
  gender: string;
  is_living: boolean;
  enstoolment_date?: string | null;
}

interface PersonFormProps {
  onPersonCreated: (newPerson: Person) => void;
  userRole?: string;
  existingPerson?: any;
}

export const PersonForm: React.FC<PersonFormProps> = ({ onPersonCreated, userRole, existingPerson }) => {
  const [firstName, setFirstName] = useState(existingPerson?.first_name || '');
  const [lastName, setLastName] = useState(existingPerson?.last_name || '');
  const [maidenName, setMaidenName] = useState(existingPerson?.maiden_name || '');
  const [gender, setGender] = useState(existingPerson?.gender || 'Male');
  
  const formatDate = (dateStr: string | null | undefined) => dateStr ? dateStr.substring(0, 10) : '';
  
  const [birthDate, setBirthDate] = useState(formatDate(existingPerson?.birth_date));
  const [birthPlace, setBirthPlace] = useState(existingPerson?.birth_place || '');
  const [deathDate, setDeathDate] = useState(formatDate(existingPerson?.death_date));
  const [deathPlace, setDeathPlace] = useState(existingPerson?.death_place || '');
  const [burialPlace, setBurialPlace] = useState(existingPerson?.burialPlace || '');
  const [isLiving, setIsLiving] = useState(existingPerson?.is_living ?? true);
  const [bio, setBio] = useState(existingPerson?.bio || '');
  const [ghanaCard, setGhanaCard] = useState(existingPerson?.ghana_card || '');
  const [gpsAddress, setGpsAddress] = useState(existingPerson?.gps_address || '');
  const [phone, setPhone] = useState(existingPerson?.phone || '');
  const [email, setEmail] = useState(existingPerson?.email || '');

  // Category 6: Residence
  const [currentAddress, setCurrentAddress] = useState(existingPerson?.currentAddress || '');
  const [hometown, setHometown] = useState(existingPerson?.hometown || '');

  // Category 8: Occupation
  const [profession, setProfession] = useState(existingPerson?.profession || '');
  const [employer, setEmployer] = useState(existingPerson?.employer || '');

  // Category 9: Religion
  const [church, setChurch] = useState(existingPerson?.church || '');
  const [baptismDetails, setBaptismDetails] = useState(existingPerson?.baptismDetails || '');

  // Category 11: Health
  const [bloodGroup, setBloodGroup] = useState(existingPerson?.bloodGroup || '');
  const [genotype, setGenotype] = useState(existingPerson?.genotype || '');
  
  const [clanId, setClanId] = useState(existingPerson?.clan_id?.toString() || '');
  const [paramountcyId, setParamountcyId] = useState(existingPerson?.paramountcy_id?.toString() || '');
  const [subStoolId, setSubStoolId] = useState(existingPerson?.sub_stool_id?.toString() || '');
  const [enstoolmentDate, setEnstoolmentDate] = useState(formatDate(existingPerson?.enstoolment_date));
  
  const [clans, setClans] = useState<{id: number, name: string}[]>([]);
  const [paramountcies, setParamountcies] = useState<{id: number, name: string}[]>([]);
  const [subStools, setSubStools] = useState<{id: number, name: string, paramountcyId: number}[]>([]);

  // Managed Lookups
  const [professionsList, setProfessionsList] = useState<string[]>([]);
  const [religionsList, setReligionsList] = useState<string[]>([]);
  const [employersList, setEmployersList] = useState<string[]>([]);

  // Collapsible section state
  const [activeSection, setActiveSection] = useState('identity');

  useEffect(() => {
    fetch('/api/royal/clans').then(r => r.json()).then(setClans).catch(console.error);
    fetch('/api/royal/paramountcies').then(r => r.json()).then(setParamountcies).catch(console.error);
    fetch('/api/royal/sub-stools').then(r => r.json()).then(setSubStools).catch(console.error);
    fetch('/api/lookups/professions').then(r => r.json()).then(setProfessionsList).catch(console.error);
    fetch('/api/lookups/religions').then(r => r.json()).then(setReligionsList).catch(console.error);
    fetch('/api/lookups/employers').then(r => r.json()).then(setEmployersList).catch(console.error);
  }, []);
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const isReadOnly = userRole === 'Staff';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (isReadOnly) {
      setError("Forbidden: Read-only access level. Staff cannot create individuals.");
      return;
    }

    if (!firstName.trim() || !lastName.trim()) {
      setError("First and Last name are required.");
      return;
    }

    try {
      const isUpdate = !!existingPerson;
      const url = isUpdate ? `/api/people/${existingPerson.person_id}` : '/api/people';
      const method = isUpdate ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': userRole || '',
        },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          maiden_name: maidenName || null,
          gender,
          birth_date: birthDate || null,
          birth_place: birthPlace || null,
          death_date: isLiving ? null : (deathDate || null),
          death_place: isLiving ? null : (deathPlace || null),
          burialPlace: isLiving ? null : (burialPlace || null),
          is_living: isLiving,
          bio: bio || null,
          ghana_card: ghanaCard || null,
          gps_address: gpsAddress || null,
          phone: phone || null,
          email: email || null,
          currentAddress: currentAddress || null,
          hometown: hometown || null,
          profession: profession || null,
          employer: employer || null,
          church: church || null,
          baptismDetails: baptismDetails || null,
          bloodGroup: bloodGroup || null,
          genotype: genotype || null,
          clan_id: clanId ? parseInt(clanId) : null,
          paramountcy_id: paramountcyId ? parseInt(paramountcyId) : null,
          sub_stool_id: subStoolId ? parseInt(subStoolId) : null,
          enstoolment_date: enstoolmentDate || null
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create person.");
      }

      if (!existingPerson) {
        setFirstName(''); setLastName(''); setMaidenName('');
        setBirthDate(''); setBirthPlace(''); setDeathDate(''); setDeathPlace(''); setBurialPlace('');
        setBio(''); setGhanaCard(''); setGpsAddress(''); setPhone(''); setEmail('');
        setCurrentAddress(''); setHometown(''); setProfession(''); setEmployer('');
        setChurch(''); setBaptismDetails(''); setBloodGroup(''); setGenotype('');
        setClanId(''); setParamountcyId(''); setSubStoolId(''); setEnstoolmentDate('');
        setIsLiving(true);
      }
      setSuccess(true);
      onPersonCreated(data);

      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const sectionTabStyle = (key: string): React.CSSProperties => ({
    padding: '0.35rem 0.75rem',
    fontSize: '0.75rem',
    borderRadius: '6px',
    cursor: 'pointer',
    border: 'none',
    background: activeSection === key ? 'var(--accent-gradient)' : 'rgba(239, 233, 222, 0.08)',
    color: activeSection === key ? 'var(--text-primary)' : 'var(--text-secondary)',
    fontWeight: activeSection === key ? 600 : 400,
    transition: 'background-color 140ms var(--ease), border-color 140ms var(--ease), color 140ms var(--ease), opacity 140ms var(--ease)'
  });

  return (
    <div className="glass-card">
      <div className="glass-card-header">
        <UserPlus size={18} />
        <span>{existingPerson ? 'Edit Individual' : 'Add Individual'}</span>
      </div>

      <form onSubmit={handleSubmit}>
        {isReadOnly && (
          <div className="alert alert-danger" style={{ marginBottom: '1rem', padding: '0.5rem 0.75rem', fontSize: '0.8rem' }}>
            <AlertCircle size={14} style={{ flexShrink: 0 }} />
            <span>Read-only Mode (Staff Access)</span>
          </div>
        )}

        {/* Section Tabs */}
        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
          <button type="button" style={sectionTabStyle('identity')} onClick={() => setActiveSection('identity')}>Identity</button>
          <button type="button" style={sectionTabStyle('contact')} onClick={() => setActiveSection('contact')}>Contact & Residence</button>
          <button type="button" style={sectionTabStyle('occupation')} onClick={() => setActiveSection('occupation')}>Occupation & Religion</button>
          <button type="button" style={sectionTabStyle('health')} onClick={() => setActiveSection('health')}>Health</button>
          <button type="button" style={sectionTabStyle('royal')} onClick={() => setActiveSection('royal')}>Royal / Stool</button>
        </div>

        {/* ── IDENTITY SECTION ── */}
        {activeSection === 'identity' && (
          <>
            <div className="form-row">
              <div className="form-group">
                <label>First Name</label>
                <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="e.g. John" disabled={isReadOnly} />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="e.g. Smith" disabled={isReadOnly} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Maiden Name</label>
                <input type="text" value={maidenName} onChange={e => setMaidenName(e.target.value)} placeholder="Optional" disabled={isReadOnly} />
              </div>
              <div className="form-group">
                <label>Gender</label>
                <select value={gender} onChange={e => setGender(e.target.value)} disabled={isReadOnly}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Unknown">Unknown</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Birth Date</label>
                <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} disabled={isReadOnly} />
              </div>
              <div className="form-group">
                <label>Birth Place</label>
                <input type="text" value={birthPlace} onChange={e => setBirthPlace(e.target.value)} placeholder="City, Country" disabled={isReadOnly} />
              </div>
            </div>

            <div className="form-group checkbox-group">
              <input type="checkbox" id="isLiving" checked={isLiving} onChange={e => setIsLiving(e.target.checked)} disabled={isReadOnly} />
              <label htmlFor="isLiving" style={{ cursor: isReadOnly ? 'default' : 'pointer' }}>Individual is Living</label>
            </div>

            {!isLiving && (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label>Death Date</label>
                    <input type="date" value={deathDate} onChange={e => setDeathDate(e.target.value)} disabled={isReadOnly} />
                  </div>
                  <div className="form-group">
                    <label>Death Place</label>
                    <input type="text" value={deathPlace} onChange={e => setDeathPlace(e.target.value)} placeholder="City, Country" disabled={isReadOnly} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Burial Place</label>
                  <input type="text" value={burialPlace} onChange={e => setBurialPlace(e.target.value)} placeholder="Cemetery / Location" disabled={isReadOnly} />
                </div>
              </>
            )}

            <div className="form-group">
              <label>Biography</label>
              <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Life events, hobbies, or footnotes..." rows={2} disabled={isReadOnly} />
            </div>
          </>
        )}

        {/* ── CONTACT & RESIDENCE SECTION ── */}
        {activeSection === 'contact' && (
          <>
            <div className="form-row">
              <div className="form-group">
                <label>Phone</label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+233 XX XXX XXXX" disabled={isReadOnly} />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@example.com" disabled={isReadOnly} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Ghana Card No.</label>
                <input type="text" value={ghanaCard} onChange={e => setGhanaCard(e.target.value)} placeholder="GHA-XXXXXXXXX-X" disabled={isReadOnly} />
              </div>
              <div className="form-group">
                <label>GPS Address</label>
                <input type="text" value={gpsAddress} onChange={e => setGpsAddress(e.target.value)} placeholder="e.g. GA-XXX-XXXX" disabled={isReadOnly} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Current Address</label>
                <input type="text" value={currentAddress} onChange={e => setCurrentAddress(e.target.value)} placeholder="Street, City" disabled={isReadOnly} />
              </div>
              <div className="form-group">
                <label>Hometown</label>
                <input type="text" value={hometown} onChange={e => setHometown(e.target.value)} placeholder="Hometown" disabled={isReadOnly} />
              </div>
            </div>
          </>
        )}

        {/* ── OCCUPATION & RELIGION SECTION ── */}
        {activeSection === 'occupation' && (
          <>
            <div className="form-row">
              <div className="form-group">
                <label>Profession</label>
                <select value={profession} onChange={e => setProfession(e.target.value)} disabled={isReadOnly}>
                  <option value="">Select Profession</option>
                  {professionsList.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Employer</label>
                <select value={employer} onChange={e => setEmployer(e.target.value)} disabled={isReadOnly}>
                  <option value="">Select Employer / Institution</option>
                  {employersList.map(emp => <option key={emp} value={emp}>{emp}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Church / Religious Body</label>
                <select value={church} onChange={e => setChurch(e.target.value)} disabled={isReadOnly}>
                  <option value="">Select Religious Denomination</option>
                  {religionsList.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Baptism Details</label>
                <input type="text" value={baptismDetails} onChange={e => setBaptismDetails(e.target.value)} placeholder="Date / Church" disabled={isReadOnly} />
              </div>
            </div>
          </>
        )}

        {/* ── HEALTH SECTION ── */}
        {activeSection === 'health' && (
          <>
            <div className="form-row">
              <div className="form-group">
                <label>Blood Group</label>
                <select value={bloodGroup} onChange={e => setBloodGroup(e.target.value)} disabled={isReadOnly}>
                  <option value="">Unknown</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
              <div className="form-group">
                <label>Genotype</label>
                <select value={genotype} onChange={e => setGenotype(e.target.value)} disabled={isReadOnly}>
                  <option value="">Unknown</option>
                  <option value="AA">AA</option>
                  <option value="AS">AS</option>
                  <option value="SS">SS</option>
                  <option value="AC">AC</option>
                  <option value="SC">SC</option>
                </select>
              </div>
            </div>
          </>
        )}

        {/* ── ROYAL / STOOL SECTION ── */}
        {activeSection === 'royal' && (
          <>
            <div className="form-row">
              <div className="form-group">
                <label>Abusua (Clan)</label>
                <select value={clanId} onChange={e => setClanId(e.target.value)} disabled={isReadOnly}>
                  <option value="">None / Unknown</option>
                  {clans.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Royal Stool (Paramountcy)</label>
                <select value={paramountcyId} onChange={e => { setParamountcyId(e.target.value); setSubStoolId(''); }} disabled={isReadOnly}>
                  <option value="">None</option>
                  {paramountcies.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
            </div>
            
            {paramountcyId && (
              <div className="form-row">
                <div className="form-group">
                  <label>Sub-Stool</label>
                  <select value={subStoolId} onChange={e => setSubStoolId(e.target.value)} disabled={isReadOnly}>
                    <option value="">None</option>
                    {subStools.filter(s => s.paramountcyId === parseInt(paramountcyId)).map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Enstoolment Date</label>
                  <input type="date" value={enstoolmentDate} onChange={e => setEnstoolmentDate(e.target.value)} disabled={isReadOnly} />
                </div>
              </div>
            )}
          </>
        )}

        <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={isReadOnly}>
          {isReadOnly ? 'Access Restricted' : (existingPerson ? 'Save Changes' : 'Register Individual')}
        </button>

        {error && (
          <div className="alert alert-danger" style={{ marginTop: '1rem' }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="alert alert-success" style={{ marginTop: '1rem' }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{existingPerson ? 'Person updated' : 'Person registered'}</span>
          </div>
        )}
      </form>
    </div>
  );
};
