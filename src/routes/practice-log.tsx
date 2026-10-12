import { Button } from '@/components/ui/button';
import { useElapsed, usePractice } from '@/hooks/use-practice';
import {
  clearPractice,
  dayKey,
  exportPractice,
  formatDuration,
  importPractice,
  lastDaysSeconds,
  secondsByDay,
  secondsByPage,
  streak,
} from '@/lib/practice-log';
import { Link } from '@tanstack/react-router';
import { Download, Trash2, Upload } from 'lucide-react';
import { useRef, useState } from 'react';

const HISTORY_DAYS = 30;
const dayLabel = (key: string) =>
  new Date(`${key}T12:00:00`).toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

export function PracticeLogPage() {
  const { entries, running } = usePractice();
  const elapsed = useElapsed(running?.since);
  const [message, setMessage] = useState('');
  const [confirming, setConfirming] = useState(false);
  const file = useRef<HTMLInputElement>(null);

  const days = secondsByDay(entries);
  const today = days.get(dayKey(new Date())) ?? 0;
  const pages = secondsByPage(entries).slice(0, 10);
  const history = [...days.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, HISTORY_DAYS);
  const maxDay = Math.max(1, ...history.map(([, s]) => s));

  const download = () => {
    const url = URL.createObjectURL(
      new Blob([exportPractice()], { type: 'application/json' }),
    );
    const a = document.createElement('a');
    a.href = url;
    a.download = `tonic-pratica-${dayKey(new Date())}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const upload = async (picked: File | undefined) => {
    if (!picked) return;
    try {
      const added = importPractice(await picked.text());
      setMessage(
        `${added} ${added === 1 ? 'registro importado' : 'registros importados'}.`,
      );
    } catch {
      setMessage('Arquivo inválido.');
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight">
          Diário de prática
        </h1>
        <p className="text-muted-foreground">
          Use "Iniciar prática" na barra lateral: o tempo é contado por tela
          enquanto você navega. Tudo fica salvo só neste navegador.
        </p>
      </div>

      <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          ['Hoje', formatDuration(today + elapsed)],
          [
            'Últimos 7 dias',
            formatDuration(lastDaysSeconds(entries, 7) + elapsed),
          ],
          [
            'Sequência',
            `${streak(entries)} ${streak(entries) === 1 ? 'dia' : 'dias'}`,
          ],
          [
            'Total',
            formatDuration(
              entries.reduce((s, e) => s + e.seconds, 0) + elapsed,
            ),
          ],
        ].map(([label, value]) => (
          <div key={label} className="flex flex-col rounded-xl border p-3">
            <dt className="text-sm text-muted-foreground">{label}</dt>
            <dd className="text-2xl font-semibold tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold tracking-tight">Por dia</h2>
        {history.length === 0 ? (
          <p className="text-muted-foreground">
            Nenhuma prática registrada ainda.
          </p>
        ) : (
          <ul className="flex flex-col gap-1">
            {history.map(([key, seconds]) => (
              <li
                key={key}
                className="grid grid-cols-[8rem_1fr_6rem] items-center gap-3 text-sm"
              >
                <span className="text-muted-foreground">{dayLabel(key)}</span>
                <span className="h-2 rounded-full bg-muted">
                  <span
                    className="block h-full rounded-full bg-foreground"
                    style={{ width: `${(seconds / maxDay) * 100}%` }}
                  />
                </span>
                <span className="text-right tabular-nums">
                  {formatDuration(seconds)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {pages.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-semibold tracking-tight">Por tela</h2>
          <ul className="flex flex-col gap-1 text-sm">
            {pages.map((p) => (
              <li key={p.path} className="flex justify-between gap-3">
                <Link to={p.path} className="hover:underline">
                  {p.title}
                </Link>
                <span className="tabular-nums text-muted-foreground">
                  {formatDuration(p.seconds)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold tracking-tight">Backup</h2>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            disabled={!entries.length}
            onClick={download}
          >
            <Download data-icon="inline-start" />
            Exportar JSON
          </Button>
          <Button variant="outline" onClick={() => file.current?.click()}>
            <Upload data-icon="inline-start" />
            Importar JSON
          </Button>
          <input
            ref={file}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              void upload(e.target.files?.[0]);
              e.target.value = '';
            }}
          />
          <Button
            variant="ghost"
            disabled={!entries.length && !running}
            onClick={() => {
              if (!confirming) return setConfirming(true);
              clearPractice();
              setConfirming(false);
              setMessage('Diário apagado.');
            }}
            onBlur={() => setConfirming(false)}
          >
            <Trash2 data-icon="inline-start" />
            {confirming ? 'Clique de novo para apagar tudo' : 'Apagar tudo'}
          </Button>
        </div>
        <p role="status" className="min-h-6 text-sm text-muted-foreground">
          {message}
        </p>
      </section>
    </div>
  );
}
