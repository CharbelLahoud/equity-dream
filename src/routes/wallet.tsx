import { useMemo, useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { AppShell, StatCard } from '@/components/app-shell';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

import {
  ArrowDownToLine,
  ArrowUpFromLine,
  CreditCard,
  TrendingUp,
  Wallet,
} from 'lucide-react';

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import {
  depositMoney,
  getWalletBalance,
  getWalletTransactions,
  withdrawMoney,
  type WalletTransaction,
} from '@/services/wallet.service';

export const Route = createFileRoute('/wallet')({
  head: () => ({
    meta: [
      {
        title: 'Wallet · Meridian Trading',
      },
      {
        name: 'description',
        content:
          'Deposit, withdraw and review your wallet activity.',
      },
    ],
  }),

  component: WalletPage,
});

function WalletPage() {
  const queryClient = useQueryClient();

  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');

  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<
    'success' | 'error' | ''
  >('');

  const balanceQuery = useQuery({
    queryKey: ['wallet', 'balance'],
    queryFn: getWalletBalance,
  });

  const transactionsQuery = useQuery({
    queryKey: ['wallet', 'transactions'],
    queryFn: getWalletTransactions,
  });

  const transactions: WalletTransaction[] = Array.isArray(
    transactionsQuery.data,
  )
    ? transactionsQuery.data
    : [];

  const balance = Number(balanceQuery.data?.balance ?? 0);

  const refreshWallet = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: ['wallet', 'balance'],
      }),

      queryClient.invalidateQueries({
        queryKey: ['wallet', 'transactions'],
      }),
    ]);
  };

  const depositMutation = useMutation({
    mutationFn: depositMoney,

    onSuccess: async () => {
      setDepositAmount('');
      setMessage('Deposit completed successfully.');
      setMessageType('success');

      await refreshWallet();
    },

    onError: (error: unknown) => {
      setMessage(getErrorMessage(error));
      setMessageType('error');
    },
  });

  const withdrawMutation = useMutation({
    mutationFn: withdrawMoney,

    onSuccess: async () => {
      setWithdrawAmount('');
      setMessage('Withdrawal completed successfully.');
      setMessageType('success');

      await refreshWallet();
    },

    onError: (error: unknown) => {
      setMessage(getErrorMessage(error));
      setMessageType('error');
    },
  });

  const deposits = useMemo(
    () =>
      transactions.filter((transaction) => {
        const type =
          transaction.type?.toUpperCase() ?? '';

        return type === 'DEPOSIT';
      }),
    [transactions],
  );

  const withdrawals = useMemo(
    () =>
      transactions.filter((transaction) => {
        const type =
          transaction.type?.toUpperCase() ?? '';

        return (
          type === 'WITHDRAWAL' ||
          type === 'WITHDRAW'
        );
      }),
    [transactions],
  );

  const completedDeposits = useMemo(
    () =>
      deposits.filter((transaction) => {
        const status =
          transaction.status?.toUpperCase() ??
          'COMPLETED';

        return status === 'COMPLETED';
      }),
    [deposits],
  );

  const completedWithdrawals = useMemo(
    () =>
      withdrawals.filter((transaction) => {
        const status =
          transaction.status?.toUpperCase() ??
          'COMPLETED';

        return status === 'COMPLETED';
      }),
    [withdrawals],
  );

  const totalDeposits = useMemo(
    () =>
      completedDeposits.reduce(
        (total, transaction) =>
          total + Number(transaction.amount ?? 0),
        0,
      ),
    [completedDeposits],
  );

  const totalWithdrawals = useMemo(
    () =>
      completedWithdrawals.reduce(
        (total, transaction) =>
          total + Number(transaction.amount ?? 0),
        0,
      ),
    [completedWithdrawals],
  );

  const walletHistory = useMemo(
    () => createWalletHistory(transactions),
    [transactions],
  );

  const clearMessage = () => {
    setMessage('');
    setMessageType('');
  };

  const showError = (text: string) => {
    setMessage(text);
    setMessageType('error');
  };

  const handleDeposit = () => {
    clearMessage();

    const amount = Number(depositAmount);

    if (!Number.isFinite(amount) || amount < 1) {
      showError('Enter a valid deposit amount.');
      return;
    }

    depositMutation.mutate(amount);
  };

  const handleWithdraw = () => {
    clearMessage();

    const amount = Number(withdrawAmount);

    if (!Number.isFinite(amount) || amount < 1) {
      showError('Enter a valid withdrawal amount.');
      return;
    }

    withdrawMutation.mutate(amount);
  };

  return (
    <AppShell
      title="Wallet"
      subtitle="Manage your cash balance and transfers."
    >
      {message && (
        <div
          className={`mb-6 rounded-lg border px-4 py-3 text-sm ${
            messageType === 'success'
              ? 'border-profit/30 bg-profit/10 text-profit'
              : 'border-loss/30 bg-loss/10 text-loss'
          }`}
        >
          {message}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <BalanceCard
            balance={balance}
            loading={balanceQuery.isLoading}
            error={balanceQuery.isError}
            lastDepositAt={
              balanceQuery.data?.lastDepositAt
            }
          />

          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              label="Total Deposits"
              value={formatCurrency(totalDeposits)}
              hint={`${completedDeposits.length} completed deposit records`}
              deltaTone="profit"
              icon={ArrowDownToLine}
            />

            <StatCard
              label="Total Withdrawals"
              value={formatCurrency(totalWithdrawals)}
              hint={`${completedWithdrawals.length} completed withdrawal records`}
              icon={ArrowUpFromLine}
            />

            <StatCard
              label="Current Balance"
              value={formatCurrency(balance)}
              hint="Available funds"
              deltaTone="profit"
              icon={TrendingUp}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Balance History</CardTitle>
            </CardHeader>

            <CardContent>
              {transactionsQuery.isLoading ? (
                <StateRow text="Loading Wallet history..." />
              ) : transactionsQuery.isError ? (
                <StateRow
                  text="Unable to load Wallet history."
                  error
                />
              ) : walletHistory.length === 0 ? (
                <StateRow text="No Wallet history yet." />
              ) : (
                <div className="h-56">
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >
                    <AreaChart data={walletHistory}>
                      <defs>
                        <linearGradient
                          id="wallet-gradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#F59E0B"
                            stopOpacity={0.3}
                          />

                          <stop
                            offset="100%"
                            stopColor="#F59E0B"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>

                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#E2E8F0"
                      />

                      <XAxis
                        dataKey="day"
                        tick={{ fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                      />

                      <YAxis
                        tick={{ fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                        width={80}
                        tickFormatter={(value) =>
                          `$${Number(value).toLocaleString()}`
                        }
                      />

                      <Tooltip
                        contentStyle={{
                          borderRadius: 8,
                          fontSize: 12,
                        }}
                        formatter={(value) => [
                          formatCurrency(Number(value ?? 0)),
                          'Balance',
                        ]}
                      />

                      <Area
                        type="monotone"
                        dataKey="balance"
                        stroke="#F59E0B"
                        strokeWidth={2}
                        fill="url(#wallet-gradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Transaction Timeline</CardTitle>
            </CardHeader>

            <CardContent>
              {transactionsQuery.isLoading ? (
                <StateRow text="Loading transactions..." />
              ) : transactionsQuery.isError ? (
                <StateRow
                  text="Unable to load transactions."
                  error
                />
              ) : transactions.length === 0 ? (
                <StateRow text="No Wallet transactions yet." />
              ) : (
                <ol className="relative space-y-6 border-l-2 border-border pl-6">
                  {transactions
                    .slice(0, 10)
                    .map((transaction, index) => (
                      <TransactionTimelineRow
                        key={getTransactionId(
                          transaction,
                          index,
                        )}
                        transaction={transaction}
                      />
                    ))}
                </ol>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <MoveFundsCard
            depositAmount={depositAmount}
            withdrawAmount={withdrawAmount}
            depositPending={depositMutation.isPending}
            withdrawPending={withdrawMutation.isPending}
            onDepositAmountChange={setDepositAmount}
            onWithdrawAmountChange={setWithdrawAmount}
            onDeposit={handleDeposit}
            onWithdraw={handleWithdraw}
          />

          <Card>
            <CardHeader>
              <CardTitle>History</CardTitle>
            </CardHeader>

            <CardContent>
              <Tabs defaultValue="deposits">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="deposits">
                    Deposits
                  </TabsTrigger>

                  <TabsTrigger value="withdrawals">
                    Withdrawals
                  </TabsTrigger>
                </TabsList>

                <TabsContent
                  value="deposits"
                  className="mt-3 space-y-2"
                >
                  {deposits.length === 0 ? (
                    <StateRow text="No deposits yet." />
                  ) : (
                    deposits.map((transaction, index) => (
                      <HistoryRow
                        key={getTransactionId(
                          transaction,
                          index,
                        )}
                        transaction={transaction}
                      />
                    ))
                  )}
                </TabsContent>

                <TabsContent
                  value="withdrawals"
                  className="mt-3 space-y-2"
                >
                  {withdrawals.length === 0 ? (
                    <StateRow text="No withdrawals yet." />
                  ) : (
                    withdrawals.map(
                      (transaction, index) => (
                        <HistoryRow
                          key={getTransactionId(
                            transaction,
                            index,
                          )}
                          transaction={transaction}
                        />
                      ),
                    )
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

function BalanceCard({
  balance,
  loading,
  error,
  lastDepositAt,
}: {
  balance: number;
  loading: boolean;
  error: boolean;
  lastDepositAt?: string | null;
}) {
  return (
    <div className="relative overflow-hidden rounded-xl bg-navy p-6 text-white">
      <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_80%_20%,#F59E0B_0%,transparent_40%),radial-gradient(circle_at_20%_80%,#1E3A8A_0%,transparent_45%)]" />

      <div className="relative flex items-start justify-between">
        <div>
          <div className="text-xs uppercase tracking-wider text-white/60">
            Available balance
          </div>

          <div className="mt-2 text-4xl font-semibold tracking-tight">
            {loading
              ? 'Loading...'
              : formatCurrency(balance)}
          </div>

          {error && (
            <div className="mt-2 text-xs text-red-300">
              Unable to load Wallet balance.
            </div>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-white/70">
            <span>
              Buying power: {formatCurrency(balance)}
            </span>

            {lastDepositAt && (
              <span className="text-gold">
                Last deposit: {formatDate(lastDepositAt)}
              </span>
            )}
          </div>
        </div>

        <div className="grid h-12 w-12 place-items-center rounded-lg bg-white/10">
          <Wallet className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}

function MoveFundsCard({
  depositAmount,
  withdrawAmount,
  depositPending,
  withdrawPending,
  onDepositAmountChange,
  onWithdrawAmountChange,
  onDeposit,
  onWithdraw,
}: {
  depositAmount: string;
  withdrawAmount: string;
  depositPending: boolean;
  withdrawPending: boolean;
  onDepositAmountChange: (value: string) => void;
  onWithdrawAmountChange: (value: string) => void;
  onDeposit: () => void;
  onWithdraw: () => void;
}) {
  const depositDisabled =
    depositPending ||
    withdrawPending ||
    !depositAmount ||
    Number(depositAmount) < 1;

  const withdrawDisabled =
    withdrawPending ||
    depositPending ||
    !withdrawAmount ||
    Number(withdrawAmount) < 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Move Funds</CardTitle>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="deposit">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="deposit">
              Deposit
            </TabsTrigger>

            <TabsTrigger value="withdraw">
              Withdraw
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="deposit"
            className="mt-4 space-y-3"
          >
            <div className="space-y-2">
              <Label htmlFor="deposit-amount">
                Amount
              </Label>

              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>

                <Input
                  id="deposit-amount"
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder="1,000.00"
                  className="h-11 pl-7"
                  value={depositAmount}
                  onChange={(event) =>
                    onDepositAmountChange(
                      event.target.value,
                    )
                  }
                />
              </div>
            </div>

            <div className="flex gap-2">
              {[500, 1000, 5000].map((amount) => (
                <button
                  key={amount}
                  type="button"
                  className="flex-1 rounded-md border py-1.5 text-xs hover:bg-muted"
                  onClick={() =>
                    onDepositAmountChange(
                      String(amount),
                    )
                  }
                >
                  {amount >= 1000
                    ? `$${amount / 1000}K`
                    : `$${amount}`}
                </button>
              ))}
            </div>

            <Button
              className="h-11 w-full"
              disabled={depositDisabled}
              onClick={onDeposit}
            >
              {depositPending
                ? 'Depositing...'
                : 'Deposit funds'}
            </Button>
          </TabsContent>

          <TabsContent
            value="withdraw"
            className="mt-4 space-y-3"
          >
            <div className="space-y-2">
              <Label htmlFor="withdraw-amount">
                Amount
              </Label>

              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>

                <Input
                  id="withdraw-amount"
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder="0.00"
                  className="h-11 pl-7"
                  value={withdrawAmount}
                  onChange={(event) =>
                    onWithdrawAmountChange(
                      event.target.value,
                    )
                  }
                />
              </div>
            </div>

            <Button
              className="h-11 w-full"
              variant="outline"
              disabled={withdrawDisabled}
              onClick={onWithdraw}
            >
              {withdrawPending
                ? 'Withdrawing...'
                : 'Withdraw'}
            </Button>

            <p className="text-[11px] text-muted-foreground">
              Withdrawals are subject to the Wallet
              balance and holding-period rules.
            </p>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function TransactionTimelineRow({
  transaction,
}: {
  transaction: WalletTransaction;
}) {
  const type =
    transaction.type?.toUpperCase() ?? '';

  const status =
    transaction.status?.toUpperCase() ??
    'COMPLETED';

  const isDeposit = type === 'DEPOSIT';

  const isWithdrawal =
    type === 'WITHDRAWAL' ||
    type === 'WITHDRAW';

  const isRejected = status === 'REJECTED';

  return (
    <li className="relative">
      <span
        className={`absolute -left-[31px] top-0 grid h-6 w-6 place-items-center rounded-full ring-4 ring-background ${
          isRejected
            ? 'bg-muted text-muted-foreground'
            : isDeposit
              ? 'bg-profit/15 text-profit'
              : isWithdrawal
                ? 'bg-loss/15 text-loss'
                : 'bg-primary/15 text-primary'
        }`}
      >
        {isDeposit ? (
          <ArrowDownToLine className="h-3 w-3" />
        ) : isWithdrawal ? (
          <ArrowUpFromLine className="h-3 w-3" />
        ) : (
          <CreditCard className="h-3 w-3" />
        )}
      </span>

      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-sm font-medium">
            {formatTransactionType(
              transaction.type,
            )}
          </div>

          <div className="text-xs text-muted-foreground">
            {formatDate(transaction.createdAt)}
          </div>

          {transaction.description && (
            <div className="mt-1 text-xs text-muted-foreground">
              {transaction.description}
            </div>
          )}
        </div>

        <div className="text-right">
          <div
            className={`text-sm font-semibold ${
              isRejected
                ? 'text-muted-foreground line-through'
                : isDeposit
                  ? 'text-profit'
                  : isWithdrawal
                    ? 'text-loss'
                    : ''
            }`}
          >
            {!isRejected && isDeposit ? '+' : ''}

            {!isRejected && isWithdrawal
              ? '-'
              : ''}

            {formatCurrency(transaction.amount)}
          </div>

          <Badge
            variant="outline"
            className={
              isRejected
                ? 'border-loss/30 text-[10px] text-loss'
                : 'text-[10px]'
            }
          >
            {status}
          </Badge>
        </div>
      </div>
    </li>
  );
}

function HistoryRow({
  transaction,
}: {
  transaction: WalletTransaction;
}) {
  const status =
    transaction.status?.toUpperCase() ??
    'COMPLETED';

  const isRejected = status === 'REJECTED';

  return (
    <div className="flex items-center justify-between rounded-md border p-3">
      <div className="min-w-0">
        <div
          className={`text-sm font-medium ${
            isRejected
              ? 'text-muted-foreground line-through'
              : ''
          }`}
        >
          {formatCurrency(transaction.amount)}
        </div>

        <div className="text-[11px] text-muted-foreground">
          {formatDate(transaction.createdAt)}
        </div>

        {transaction.description && (
          <div className="mt-1 text-[11px] text-muted-foreground">
            {transaction.description}
          </div>
        )}
      </div>

      <Badge
        variant="outline"
        className={
          isRejected
            ? 'border-loss/30 text-[10px] text-loss'
            : 'text-[10px]'
        }
      >
        {status}
      </Badge>
    </div>
  );
}

function StateRow({
  text,
  error = false,
}: {
  text: string;
  error?: boolean;
}) {
  return (
    <div
      className={`rounded-md border border-dashed p-6 text-center text-sm ${
        error
          ? 'border-loss/30 bg-loss/10 text-loss'
          : 'text-muted-foreground'
      }`}
    >
      {text}
    </div>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(value ?? 0));
}

function formatDate(value?: string) {
  if (!value) {
    return 'Date unavailable';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

function formatTransactionType(type?: string) {
  if (!type) {
    return 'Wallet Transaction';
  }

  return type
    .replaceAll('_', ' ')
    .toLowerCase()
    .replace(/\b\w/g, (character) =>
      character.toUpperCase(),
    );
}

function getTransactionId(
  transaction: WalletTransaction,
  index: number,
) {
  return (
    transaction._id ??
    transaction.id ??
    `${transaction.type}-${transaction.createdAt ?? index}`
  );
}

function createWalletHistory(
  transactions: WalletTransaction[],
) {
  let runningBalance = 0;

  return [...transactions]
    .sort((first, second) => {
      const firstTime = new Date(
        first.createdAt ?? 0,
      ).getTime();

      const secondTime = new Date(
        second.createdAt ?? 0,
      ).getTime();

      return firstTime - secondTime;
    })
    .map((transaction, index) => {
      const type =
        transaction.type?.toUpperCase() ?? '';

      const status =
        transaction.status?.toUpperCase() ??
        'COMPLETED';

      const amount = Number(
        transaction.amount ?? 0,
      );

      /*
       * Only completed transactions change the
       * calculated Wallet history.
       */
      if (status === 'COMPLETED') {
        if (
          type === 'DEPOSIT' ||
          type === 'SELL'
        ) {
          runningBalance += amount;
        }

        if (
          type === 'WITHDRAWAL' ||
          type === 'WITHDRAW' ||
          type === 'BUY'
        ) {
          runningBalance -= amount;
        }
      }

      const transactionDate = transaction.createdAt
        ? new Date(transaction.createdAt)
        : null;

      const formattedDate =
        transactionDate &&
        !Number.isNaN(transactionDate.getTime())
          ? transactionDate.toLocaleString([], {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })
          : `Transaction ${index + 1}`;

      return {
        day: formattedDate,
        balance: Math.max(runningBalance, 0),
      };
    }); 
}

function getErrorMessage(error: unknown) {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error
  ) {
    const response = (
      error as {
        response?: {
          data?: {
            message?: string | string[];
          };
        };
      }
    ).response;

    const backendMessage =
      response?.data?.message;

    if (Array.isArray(backendMessage)) {
      return backendMessage.join(', ');
    }

    if (typeof backendMessage === 'string') {
      return backendMessage;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'The Wallet request could not be completed.';
}