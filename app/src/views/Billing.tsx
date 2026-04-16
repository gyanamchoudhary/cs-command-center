import { useState } from 'react';
import { contracts, accounts, billingDisputes } from '@/data/sampleData';
import { Header } from '@/components/layout/Header';
import { formatCurrency, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FileText, AlertTriangle, CheckCircle, Calendar, Download, Plus } from 'lucide-react';

export function Billing() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedContract, setSelectedContract] = useState<string | null>(null);

  const filteredContracts = contracts.filter(contract => {
    const account = accounts.find(a => a.id === contract.account_id);
    const matchesSearch = account?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         contract.contract_number?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || contract.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const selectedContractDetails = selectedContract ? 
    contracts.find(c => c.id === selectedContract) : null;

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-700',
      active: 'bg-emerald-100 text-emerald-700',
      expired: 'bg-red-100 text-red-700',
      terminated: 'bg-orange-100 text-orange-700',
      pending_signature: 'bg-amber-100 text-amber-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getDaysUntilExpiry = (endDate: string) => {
    const days = Math.ceil((new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const totalContractValue = contracts
    .filter(c => c.status === 'active')
    .reduce((sum, c) => sum + (c.arr_value || 0), 0);

  const expiringContracts = contracts.filter(c => {
    if (c.status !== 'active') return false;
    const days = getDaysUntilExpiry(c.end_date);
    return days <= 90 && days > 0;
  });

  return (
    <div className="h-full flex flex-col">
      <Header
        title="Billing & Contracts"
        subtitle="Manage contracts and billing information"
        searchPlaceholder="Search contracts..."
        onSearch={setSearchQuery}
        actions={[
          {
            label: 'New Contract',
            icon: <Plus className="h-4 w-4" />,
            onClick: () => {},
            variant: 'default',
          },
        ]}
        filters={[
          {
            label: 'Status',
            value: statusFilter,
            options: [
              { value: 'all', label: 'All Statuses' },
              { value: 'active', label: 'Active' },
              { value: 'expired', label: 'Expired' },
              { value: 'pending_signature', label: 'Pending' },
            ],
            onChange: setStatusFilter,
          },
        ]}
      />

      {/* Summary Cards */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <p className="text-sm text-gray-500">Total Contract Value</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalContractValue, { compact: true })}</p>
            <p className="text-sm text-gray-400 mt-1">Active contracts</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <p className="text-sm text-gray-500">Expiring (90d)</p>
            <p className="text-2xl font-bold text-amber-600">{expiringContracts.length}</p>
            <p className="text-sm text-gray-400 mt-1">Contracts need attention</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <p className="text-sm text-gray-500">Active Contracts</p>
            <p className="text-2xl font-bold text-emerald-600">
              {contracts.filter(c => c.status === 'active').length}
            </p>
            <p className="text-sm text-gray-400 mt-1">Across all accounts</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <p className="text-sm text-gray-500">Open Disputes</p>
            <p className="text-2xl font-bold text-red-600">{billingDisputes.filter(d => d.status === 'open').length}</p>
            <p className="text-sm text-gray-400 mt-1">Require resolution</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold">Contract</TableHead>
                <TableHead className="font-semibold">Account</TableHead>
                <TableHead className="font-semibold">ARR Value</TableHead>
                <TableHead className="font-semibold">Start Date</TableHead>
                <TableHead className="font-semibold">End Date</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Auto-Renew</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContracts.map((contract) => {
                const account = accounts.find(a => a.id === contract.account_id);
                const daysUntilExpiry = getDaysUntilExpiry(contract.end_date);
                const isExpiringSoon = daysUntilExpiry <= 90 && daysUntilExpiry > 0 && contract.status === 'active';
                
                return (
                  <TableRow
                    key={contract.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => setSelectedContract(contract.id)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{contract.contract_number || 'No Number'}</p>
                          <p className="text-sm text-gray-500">{contract.pricing_plan}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">{account?.name}</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{formatCurrency(contract.arr_value || 0, { compact: true })}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{formatDate(contract.start_date)}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={cn('text-sm', isExpiringSoon && 'text-amber-600 font-medium')}>
                          {formatDate(contract.end_date)}
                        </span>
                        {isExpiringSoon && (
                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(contract.status)}>
                        {contract.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {contract.auto_renewal ? (
                        <div className="flex items-center gap-1 text-emerald-600">
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-sm">Yes</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">No</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Download className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Billing Disputes Section */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing Disputes</h3>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold">Dispute Type</TableHead>
                  <TableHead className="font-semibold">Account</TableHead>
                  <TableHead className="font-semibold">Amount</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {billingDisputes.map((dispute) => {
                  const account = accounts.find(a => a.id === dispute.account_id);
                  return (
                    <TableRow key={dispute.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                          </div>
                          <span className="font-medium text-gray-900 capitalize">
                            {dispute.dispute_type.replace('_', ' ')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">{account?.name}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-red-600">{formatCurrency(dispute.amount_disputed)}</span>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={dispute.status === 'open' ? 'destructive' : 'outline'}
                          className="capitalize"
                        >
                          {dispute.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-500">{formatDate(dispute.created_at)}</span>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {billingDisputes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      No billing disputes
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Contract Detail Modal */}
      <Dialog open={!!selectedContract} onOpenChange={() => setSelectedContract(null)}>
        <DialogContent className="max-w-2xl">
          {selectedContractDetails && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p>{selectedContractDetails.contract_number || 'Contract Details'}</p>
                    <p className="text-sm text-gray-500 font-normal">{selectedContractDetails.pricing_plan}</p>
                  </div>
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">ARR Value</p>
                    <p className="text-xl font-semibold">{formatCurrency(selectedContractDetails.arr_value || 0)}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">MRR Value</p>
                    <p className="text-xl font-semibold">{formatCurrency(selectedContractDetails.mrr_value || 0)}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">Status</span>
                    <Badge className={getStatusColor(selectedContractDetails.status)}>
                      {selectedContractDetails.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">Contract Type</span>
                    <span className="font-medium capitalize">{selectedContractDetails.contract_type}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">Start Date</span>
                    <span className="font-medium">{formatDate(selectedContractDetails.start_date)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">End Date</span>
                    <span className="font-medium">{formatDate(selectedContractDetails.end_date)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">Auto-Renewal</span>
                    <span className="font-medium">{selectedContractDetails.auto_renewal ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">Termination Notice</span>
                    <span className="font-medium">{selectedContractDetails.termination_notice_days} days</span>
                  </div>
                  {selectedContractDetails.payment_terms && (
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500">Payment Terms</span>
                      <span className="font-medium">{selectedContractDetails.payment_terms}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-3 pt-4">
                  <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                    <Download className="h-4 w-4 mr-2" />
                    Download Contract
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Review
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
