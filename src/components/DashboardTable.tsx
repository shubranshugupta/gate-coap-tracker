"use client";

import { useState } from 'react';
import type { Timestamp } from 'firebase/firestore';
import { CATEGORIES, INSTITUTES } from '@/utils/constants';
import { useOffers } from '@/hooks/useOffers';
import ExportMenu from './ExportMenu';
import FlagButton from './FlagButton';
import type { Offer } from '@/types';

/* ── Helpers ────────────────────────────────────────────── */
function relativeTime(ts: Timestamp | null): string {
  if (!ts) return "—";
  const s = Math.floor((Date.now() - ts.toMillis()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

const FLAG_THRESHOLD = Number.parseInt(process.env.NEXT_PUBLIC_FLAG_THRESHOLD || "5");


/* ── Icons ──────────────────────────────────────────────── */
const FilterIcon = () => (
  <svg
    className="w-3.5 h-3.5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z"
    />
  </svg>
);

const AlertIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
    />
  </svg>
);

const EmptyIcon = () => (
  <svg
    className="w-10 h-10"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const SpinnerIcon = () => (
  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
    />
  </svg>
);

/* ── Skeleton Rows ──────────────────────────────────────── */
const SKELETON_WIDTHS = [
  ["w-16", "w-10", "w-8", "w-24", "w-20", "w-8", "w-12"],
  ["w-14", "w-12", "w-8", "w-20", "w-16", "w-8", "w-10"],
  ["w-12", "w-10", "w-8", "w-28", "w-18", "w-8", "w-8"],
  ["w-16", "w-14", "w-8", "w-22", "w-20", "w-8", "w-14"],
  ["w-14", "w-10", "w-8", "w-24", "w-16", "w-8", "w-10"],
];

const SkeletonRows = () => (
  <>
    {SKELETON_WIDTHS.map((row, i) => (
      <tr
        key={i}
        className="border-b"
        style={{ borderColor: "var(--color-border)" }}
      >
        {/* Score + Rank */}
        <td className="p-4">
          <div className={`skeleton h-4 mb-1.5 ${row[0]}`} />
          <div className={`skeleton h-3 ${row[1]}`} />
        </td>
        {/* Category */}
        <td className="p-4 hidden sm:table-cell">
          <div className={`skeleton h-5 rounded-full ${row[2]}`} />
        </td>
        {/* Institute */}
        <td className="p-4">
          <div className={`skeleton h-4 ${row[3]}`} />
        </td>
        {/* Program */}
        <td className="p-4 hidden md:table-cell">
          <div className={`skeleton h-4 mb-1.5 ${row[4]}`} />
          <div className={`skeleton h-3 ${row[1]}`} />
        </td>
        {/* Round */}
        <td className="p-4 hidden sm:table-cell">
          <div className={`skeleton h-5 rounded-full ${row[5]}`} />
        </td>
        {/* Time */}
        <td className="p-4 hidden lg:table-cell">
          <div className={`skeleton h-3 ${row[6]}`} />
        </td>
      </tr>
    ))}
  </>
);

/* ── Offer Row ──────────────────────────────────────────── */
/* ── Updated OfferRow ───────────────────────────────────── */
interface OfferRowProps {
  offer: Offer;
  isNew: boolean;
}

const OfferRow = ({ offer, isNew }: OfferRowProps) => (
  <tr
    className={`border-b transition-colors ${isNew ? 'row-new' : ''}`}
    style={{ borderColor: 'var(--color-border)' }}
    onMouseEnter={e => {
      if (!isNew) (e.currentTarget as HTMLElement).style.background = 'var(--color-bg-elevated)';
    }}
    onMouseLeave={e => {
      if (!isNew) (e.currentTarget as HTMLElement).style.background = '';
    }}
  >
    {/* Score / Rank */}
    <td className="p-4">
      <div
        className="text-base font-semibold"
        style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-accent)' }}
      >
        {offer.gateScore}
      </div>
      <div
        className="text-xs mt-0.5"
        style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}
      >
        #{offer.gateRank}
      </div>
    </td>

    {/* Category */}
    <td className="p-4 hidden sm:table-cell">
      <span className="badge badge-category">{offer.category}</span>
    </td>

    {/* Institute */}
    <td className="p-4">
      <span
        className="text-sm font-semibold"
        style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}
      >
        {offer.institute}
      </span>
    </td>

    {/* Program / Specialization */}
    <td className="p-4 hidden md:table-cell">
      <div className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
        {offer.programType}
      </div>
      <div
        className="text-xs mt-0.5 truncate max-w-[160px]"
        style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}
      >
        {offer.specialization}
      </div>
    </td>

    {/* Round */}
    <td className="p-4 hidden sm:table-cell">
      <span className="badge badge-round">{offer.coapRound}</span>
    </td>

    {/* Time */}
    <td className="p-4 hidden lg:table-cell">
      <span
        className="text-xs"
        style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}
      >
        {relativeTime(offer.timestamp)}
      </span>
    </td>

    {/* ── Flag ── */}
    <td className="p-4">
      <FlagButton offerId={offer.id} />
    </td>
  </tr>
);

/* ── Main Component ─────────────────────────────────────── */
export default function DashboardTable() {
  const [filterInstitute, setFilterInstitute] = useState('All');
  const [filterCategory,  setFilterCategory]  = useState('All');

  const {
    offers, loading, loadingMore,
    hasMore, error, totalLoaded, newIds, loadMore,
  } = useOffers(filterInstitute, filterCategory);

  const filtersActive = filterInstitute !== 'All' || filterCategory !== 'All';

  const clearFilters = () => {
    setFilterInstitute('All');
    setFilterCategory('All');
  };

  const selectCls = 'input-base px-3 py-2 text-xs cursor-pointer';

  const TABLE_COLS = [
    { label: 'Score / Rank', cls: '' },
    { label: 'Category',     cls: 'hidden sm:table-cell' },
    { label: 'Institute',    cls: '' },
    { label: 'Program',      cls: 'hidden md:table-cell' },
    { label: 'Round',        cls: 'hidden sm:table-cell' },
    { label: 'Time',         cls: 'hidden lg:table-cell' },
    { label: 'Flag',         cls: '' },           // ← new column
  ];

  return (
    <div className="card">

      {/* ── Table Header ── */}
      <div className="p-5 md:p-6 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

          <div className="flex items-center gap-3">
            <div>
              <h2
                className="text-lg font-bold"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}
              >
                Recent Offers
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="live-dot" style={{ width: '6px', height: '6px' }} />
                <span
                  className="text-xs"
                  style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}
                >
                  {loading
                    ? 'connecting…'
                    : `${totalLoaded.toLocaleString()} offer${totalLoaded !== 1 ? 's' : ''} loaded`}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <FilterIcon />
            <select
              value={filterInstitute}
              onChange={e => setFilterInstitute(e.target.value)}
              className={selectCls}
              style={{ maxWidth: '180px' }}
              aria-label="Filter by institute"
            >
              {INSTITUTES.map(inst => (
                <option key={inst} value={inst}>{inst}</option>
              ))}
            </select>
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className={selectCls}
              aria-label="Filter by category"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {filtersActive && (
              <button onClick={clearFilters} className="btn-ghost text-xs px-3 py-2">
                Clear
              </button>
            )}
            <div
              className="h-4 w-px mx-1 hidden sm:block"
              style={{ background: 'var(--color-border)' }}
            />
            <ExportMenu
              offers={offers}
              filterInstitute={filterInstitute}
              filterCategory={filterCategory}
              disabled={loading}
            />
          </div>
        </div>
      </div>

      {/* ── Error State ── */}
      {error && (
        <div
          className="mx-6 mt-6 flex items-start gap-3 p-4 rounded-xl"
          style={{
            background: 'var(--color-danger-muted)',
            border: '1px solid rgba(248,113,113,0.25)',
          }}
        >
          <span style={{ color: 'var(--color-danger)', flexShrink: 0 }}><AlertIcon /></span>
          <div>
            <p
              className="text-sm font-semibold"
              style={{ color: 'var(--color-danger)', fontFamily: 'var(--font-display)' }}
            >
              Connection Error
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
              {error}
            </p>
          </div>
        </div>
      )}

      {/* ── Table ── */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr
              className="border-b"
              style={{ background: 'var(--color-bg-surface)', borderColor: 'var(--color-border)' }}
            >
              {TABLE_COLS.map(col => (
                <th
                  key={col.label}
                  className={`p-4 text-[10px] font-semibold tracking-widest uppercase ${col.cls}`}
                  style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <SkeletonRows />
            ) : offers.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-16 text-center">
                  <div
                    className="flex flex-col items-center gap-3"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    <EmptyIcon />
                    <div>
                      <p
                        className="text-sm font-semibold"
                        style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-secondary)' }}
                      >
                        No offers found
                      </p>
                      <p
                        className="text-xs mt-1"
                        style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}
                      >
                        {filtersActive ? 'Try adjusting your filters' : 'Be the first to report an offer!'}
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              offers.map(offer => (
                <OfferRow
                  key={offer.id}
                  offer={offer}
                  isNew={newIds.has(offer.id)}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Load More ── */}
      {!loading && !error && hasMore && (
        <div
          className="p-5 flex items-center justify-center border-t"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="btn-ghost flex items-center gap-2 px-5 py-2.5 text-sm"
          >
            {loadingMore ? (
              <><SpinnerIcon /><span>Loading…</span></>
            ) : (
              'Load More Offers'
            )}
          </button>
        </div>
      )}

      {/* ── All loaded ── */}
      {!loading && !error && !hasMore && offers.length > 0 && (
        <div
          className="p-4 text-center border-t"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <span
            className="text-xs"
            style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}
          >
            ── all {totalLoaded} offers loaded ──
          </span>
        </div>
      )}

      {/* ── Flag legend ── */}
      <div
        className="px-5 py-3 border-t flex items-center gap-2"
        style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-surface)' }}
      >
        <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: 'var(--color-text-muted)' }}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p
          className="text-[10px]"
          style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}
        >
          Flag incorrect or fake offers. Entries flagged {FLAG_THRESHOLD} times are hidden automatically.
        </p>
      </div>

    </div>
  );}
