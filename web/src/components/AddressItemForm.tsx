'use client';

import { UserAddress } from '@/types/user';
import { FiMapPin, FiTrash2 } from 'react-icons/fi';

interface AddressItemFormProps {
  address: UserAddress;
  index: number;
  totalAddresses: number;
  loadingCep: boolean;
  onUpdate: (index: number, field: keyof UserAddress, value: any) => void;
  onCepBlur: (index: number, cep: string) => void;
  onRemove: (index: number) => void;
}

export function AddressItemForm({
  address,
  index,
  totalAddresses,
  loadingCep,
  onUpdate,
  onCepBlur,
  onRemove,
}: AddressItemFormProps) {
  return (
    <div className="p-4 bg-black/40 border border-red-500/20 rounded-xl relative space-y-4">
      <div className="flex justify-between items-center border-b border-red-900/30 pb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-red-300">
          Endereço #{index + 1} {address.is_default && '(Principal)'}
        </span>
        {totalAddresses > 1 && (
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1 cursor-pointer"
          >
            <FiTrash2 size={14} /> Remover
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs uppercase tracking-wider text-red-200 font-semibold mb-2">CEP</label>
          <input
            type="text"
            value={address.cep || ''}
            onChange={(e) => onUpdate(index, 'cep', e.target.value)}
            onBlur={(e) => onCepBlur(index, e.target.value)}
            placeholder="00000-000"
            maxLength={9}
            className="w-full bg-black/45 border border-red-500/30 rounded-xl px-4 py-3 text-white placeholder-zinc-400 focus:outline-none focus:border-white transition-colors"
          />
          {loadingCep && <span className="text-[11px] text-red-300 mt-1 block">A buscar CEP...</span>}
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs uppercase tracking-wider text-red-200 font-semibold mb-2">Rua / Logradouro</label>
          <input
            type="text"
            value={address.address || ''}
            onChange={(e) => onUpdate(index, 'address', e.target.value)}
            className="w-full bg-black/45 border border-red-500/30 rounded-xl px-4 py-3 text-white placeholder-zinc-400 focus:outline-none focus:border-white transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs uppercase tracking-wider text-red-200 font-semibold mb-2">Número</label>
          <input
            type="text"
            value={address.street_number || ''}
            onChange={(e) => onUpdate(index, 'street_number', e.target.value)}
            placeholder="Ex: 123"
            className="w-full bg-black/45 border border-red-500/30 rounded-xl px-4 py-3 text-white placeholder-zinc-400 focus:outline-none focus:border-white transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-red-200 font-semibold mb-2">Bairro</label>
          <input
            type="text"
            value={address.neighborhood || ''}
            onChange={(e) => onUpdate(index, 'neighborhood', e.target.value)}
            className="w-full bg-black/45 border border-red-500/30 rounded-xl px-4 py-3 text-white placeholder-zinc-400 focus:outline-none focus:border-white transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-red-200 font-semibold mb-2">Complemento</label>
          <input
            type="text"
            value={address.complement || ''}
            onChange={(e) => onUpdate(index, 'complement', e.target.value)}
            placeholder="Apto, Bloco..."
            className="w-full bg-black/45 border border-red-500/30 rounded-xl px-4 py-3 text-white placeholder-zinc-400 focus:outline-none focus:border-white transition-colors"
          />
        </div>
      </div>
    </div>
  );
}