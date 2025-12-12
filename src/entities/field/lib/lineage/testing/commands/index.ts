/**
 * Command-specific E2E Tests
 *
 * Tests for commands with implemented lineage handlers:
 * - eval, stats, rex, lookup, iplocation, extract, transaction, table, fields
 *
 * Commands needing handlers (not yet tested):
 * - bin, fillnull, mvexpand (structural)
 * - regex, where, dedup (filters)
 * - top, rare, rangemap, filldown, mvcombine (aggregators)
 * - rename, spath, addtotals, strcat, accum, delta, autoregress, convert (field creators)
 * - join, append, foreach, map, makeresults, gentimes, union (pipeline ops)
 */
