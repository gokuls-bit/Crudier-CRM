import React, { useState } from 'react';
import PageHeader from '../../components/layout/PageHeader';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import { useAuthStore } from '../../store/auth.store';

export const ProfilePage = () => {
  const user = useAuthStore(state => state.user);
  const [name, setName] = useState(user?.name || 'Jane Doe');
  const [email, setEmail] = useState(user?.email || 'jane@crudier.com');
  const [isSaving, setIsSaving] = useState(false);

  const handleUpdate = (e) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alert('Profile details updated successfully.');
    }, 800);
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <PageHeader 
        title="My Profile" 
        description="Update personal contact details, set avatars and check active workspaces assignments."
      />

      <div className="glass-panel p-6 rounded-xl border border-white/5 flex flex-col md:flex-row gap-6 items-start">
        <div className="flex flex-col items-center gap-3 shrink-0">
          <Avatar name={name} size="xl" />
          <Button variant="secondary" size="sm" className="py-1 px-3">
            Change Photo
          </Button>
        </div>

        <form onSubmit={handleUpdate} className="flex-1 flex flex-col gap-4 w-full">
          <Input
            type="text"
            label="Display Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Input
            type="email"
            label="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="flex flex-col gap-1 w-full text-xs">
            <span className="font-semibold text-slate-400 Outfit">My Active Role Security Clearance</span>
            <span className="bg-brand-500/10 text-brand-300 border border-brand-500/20 px-3 py-1.5 rounded-lg font-bold w-fit mt-1 select-none">
              {user?.role || 'Founder'}
            </span>
          </div>

          <Button type="submit" isLoading={isSaving} className="w-fit self-end mt-2">
            Save Profile
          </Button>
        </form>
      </div>
    </div>
  );
};
export default ProfilePage;
// Make sure to export default as well!
