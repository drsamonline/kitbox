#!/usr/bin/env python3
"""Assert that every roadmap item is scheduled in exactly one batch.

Documentation rots when a backlog and a plan drift apart: an item is added to
ROADMAP.md and never batched, or batched twice and shipped once. This is a
five-line check that makes that impossible to do quietly.

Usage: python3 tools/check-plan.py
"""
import collections, re, sys

ID = re.compile(r'E-\d{2,3}')
road = open('ROADMAP.md', encoding='utf-8').read()
plan = open('PLAN.md', encoding='utf-8').read()

road_items = set(re.findall(r'\|\s*(E-\d{2,3})\s*\|', road))
# Items may be scheduled (the index) or dropped with a reason. Both count as
# accounted for; an item in neither is the failure this check exists to catch.
scheduled_part, _, dropped_part = plan.partition('## Dropped')
dropped_part = dropped_part.split('## Item index')[0] if dropped_part else ''
index = plan.split('## Item index')[1]
scheduled = set(ID.findall(index))
dropped = set(ID.findall(dropped_part)) if '## Item index' in plan else plan
mapped = ID.findall(index) + ID.findall(dropped_part)
# An id may be mentioned more than once inside a section ("follows from E-101");
# what matters is that it is scheduled in one place and dropped in none.
counts = collections.Counter(set(ID.findall(index)))
counts.update(set(ID.findall(dropped_part)))
both = set(ID.findall(index)) & set(ID.findall(dropped_part))

fail = 0
def check(label, bad):
    global fail
    print(('PASS  ' if not bad else 'FAIL  ') + label + ('' if not bad else ': ' + ', '.join(sorted(bad))))
    if bad: fail += 1

check('every roadmap item is batched', road_items - set(mapped))
check('no item is both scheduled and dropped', both)
check('no roadmap item is batched twice', {k for k, v in counts.items() if v > 1})
check('every batched item exists in the roadmap', set(mapped) - set(ID.findall(road)))
check('no gap in the item numbering', {'E-%02d' % i for i in range(1, len(road_items) + 1)} - set(mapped))
print('\n%d items, %d batches, %d scheduled' % (len(road_items), len(re.findall(r'^\| \*\*B\d+\*\*', plan, re.M)), len(mapped)))
sys.exit(1 if fail else 0)
