// /app/profile/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { userService } from '@/services/userService';
import { UserAddress } from '@/types/user';
import { AddressItemForm } from '@/components/AddressItemForm';
import { FiUser, FiMail, FiSave, FiMapPin, FiPhone, FiPlus, FiCamera } from 'react-icons/fi';
import Image from 'next/image';

export default function ProfilePage() {
  const { user } = useAuth();
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  
  // Estados para a foto de perfil
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [loadingCepIndex, setLoadingCepIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(formatPhoneMask(user.phone || ''));
      if (user.image_url) {
        setAvatarPreview(user.image_url);
      }

      if (user.addresses && user.addresses.length > 0) {
        setAddresses(user.addresses);
      } else {
        setAddresses([
          {
            id: 1,
            user_id: user.id || 1,
            cep: '',
            address: '',
            street_number: '',
            neighborhood: '',
            complement: '',
            is_default: true,
            created_at: new Date().toISOString()
          }
        ]);
      }
    }
  }, [user]);

  const formatPhoneMask = (value: string) => {
    if (!value) return '';
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return `(${numbers}`;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length <= 11) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
    }
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhoneMask(e.target.value));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleCepBlur = async (index: number, cepValue: string) => {
    const cleanCep = cepValue.replace(/\D/g, '');
    if (cleanCep.length !== 8) return;

    setLoadingCepIndex(index);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();

      if (!data.erro) {
        const updated = [...addresses];
        updated[index] = {
          ...updated[index],
          cep: cleanCep,
          address: data.logradouro || '',
          neighborhood: data.bairro || '',
        };
        setAddresses(updated);
      } else {
        alert('CEP não encontrado.');
      }
    } catch (error) {
      console.error('Erro ao consultar CEP:', error);
    } finally {
      setLoadingCepIndex(null);
    }
  };

  const handleAddressChange = (index: number, field: keyof UserAddress, value: any) => {
    const updated = [...addresses];
    updated[index] = { ...updated[index], [field]: value };
    setAddresses(updated);
  };

  const handleAddAddress = () => {
    setAddresses([
      ...addresses,
      {
        id: Date.now(),
        user_id: user?.id || 1,
        cep: '',
        address: '',
        street_number: '',
        neighborhood: '',
        complement: '',
        is_default: addresses.length === 0,
        created_at: new Date().toISOString()
      }
    ]);
  };

  const handleRemoveAddress = (index: number) => {
    if (addresses.length === 1) {
      alert('Tens de manter pelo menos um endereço cadastrado.');
      return;
    }
    setAddresses(addresses.filter((_, i) => i !== index));
  };

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.id) return;

    setLoading(true);
    setSuccessMessage('');

    try {
      // Como agora podemos enviar uma imagem (ficheiro binário), utilizamos FormData
      const formData = new FormData();
      formData.append('name', name);
      formData.append('phone', phone.replace(/\D/g, ''));
      formData.append('addresses', JSON.stringify(addresses));
      
      if (avatarFile) {
        formData.append('image', avatarFile); // Nome do campo esperado pelo Multer no backend
      }

      await userService.updateUser(user.id, formData);
      setSuccessMessage('Perfil e moradas atualizados com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      alert('Ocorreu um erro ao atualizar o perfil.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative isolate min-h-screen w-full overflow-hidden bg-linear-to-b from-red-700 via-red-900 to-red-950 text-white selection:bg-black selection:text-white pt-24 pb-16">
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-8">
          <span className="inline-flex items-center rounded-full bg-red-800/60 px-3.5 py-1 text-sm font-medium text-red-200 ring-1 ring-inset ring-red-400/40 mb-3">
            ⚙️ Minha Conta
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight">Perfil do Utilizador</h1>
        </div>

        {successMessage && (
          <div className="mb-6 p-4 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-200 text-sm font-medium">
            {successMessage}
          </div>
        )}

        <div className="bg-black/60 backdrop-blur-md border border-red-500/20 rounded-2xl p-6 sm:p-8 shadow-2xl">
          <form onSubmit={handleSave} className="space-y-6">
            
            {/* Secção de Avatar / Imagem de Perfil */}
            <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-red-900/40">
              <div className="relative w-28 h-28 rounded-full overflow-hidden border-2 border-red-500/50 bg-zinc-900 flex items-center justify-center shadow-lg group">
                {avatarPreview ? (
                  <Image 
                    src={avatarPreview} 
                    alt="Avatar" 
                    fill 
                    className="object-cover"
                  />
                ) : (
                  <FiUser size={48} className="text-zinc-500" />
                )}
                <label htmlFor="avatar-input" className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity cursor-pointer text-xs font-semibold text-white">
                  <FiCamera size={20} className="mb-1" />
                  Alterar
                </label>
              </div>
              <div className="text-center sm:text-left">
                <h3 className="text-lg font-bold text-red-100">Foto de Perfil</h3>
                <p className="text-xs text-zinc-400 mt-1 mb-3">Escolha uma imagem nos formatos PNG, JPG ou JPEG.</p>
                <input 
                  id="avatar-input" 
                  type="file" 
                  accept="image/*" 
                  onChange={handleAvatarChange} 
                  className="hidden" 
                />
                <label 
                  htmlFor="avatar-input" 
                  className="inline-block bg-red-800/80 hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md cursor-pointer"
                >
                  Carregar Nova Foto
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs uppercase tracking-wider text-red-200 font-semibold mb-2">Nome Completo</label>
                <div className="relative">
                  <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-black/45 border border-red-500/30 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:border-white"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-red-200 font-semibold mb-2">E-mail</label>
                <div className="relative">
                  <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full bg-black/20 border border-red-900/40 rounded-xl pl-11 pr-4 py-3 text-zinc-400 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs uppercase tracking-wider text-red-200 font-semibold mb-2">Telemóvel / WhatsApp</label>
                <div className="relative">
                  <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                  <input
                    type="text"
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder="(34) 99999-9999"
                    maxLength={15}
                    className="w-full bg-black/45 border border-red-500/30 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:border-white"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-red-900/40 pt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-red-100 flex items-center gap-2">
                  <FiMapPin className="text-red-400" /> Endereços Cadastrados ({addresses.length})
                </h3>
                <button
                  type="button"
                  onClick={handleAddAddress}
                  className="flex items-center gap-1.5 bg-red-800/80 hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md cursor-pointer"
                >
                  <FiPlus size={16} /> Adicionar Endereço
                </button>
              </div>

              <div className="space-y-6">
                {addresses.map((addr, index) => (
                  <AddressItemForm
                    key={addr.id || index}
                    address={addr}
                    index={index}
                    totalAddresses={addresses.length}
                    loadingCep={loadingCepIndex === index}
                    onUpdate={handleAddressChange}
                    onCepBlur={handleCepBlur}
                    onRemove={handleRemoveAddress}
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-red-900/40">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 bg-black hover:bg-zinc-900 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-xl hover:scale-105 cursor-pointer disabled:opacity-50"
              >
                <FiSave size={18} />
                {loading ? 'A guardar...' : 'Guardar Alterações'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}