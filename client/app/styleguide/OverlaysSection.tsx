'use client';

import { useState, type ReactNode } from 'react';
import { MoreHorizontal, Pencil } from 'lucide-react';
import { Button, IconButton, Input, Textarea } from '@/components/atoms';
import { FormField, PriorityBadge, StatusBadge } from '@/components/molecules';
import { BottomSheet, Modal, SidePanel } from '@/components/organisms';

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-border bg-surface p-5 shadow-card">
      <h2 className="mb-4 text-h3 text-text-primary">{title}</h2>
      <div className="flex flex-col gap-5">{children}</div>
    </section>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-overline uppercase text-text-muted">{label}</span>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}

export function OverlaysSection() {
  const [modal, setModal] = useState(false);
  const [small, setSmall] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [panel, setPanel] = useState(false);

  return (
    <Section title="Modal · BottomSheet · SidePanel">
      <Row label="modal — focus trapped, Esc / scrim / ✕ close, back closes, body scroll locked">
        <Button variant="secondary" onClick={() => setModal(true)}>
          Open create modal (560)
        </Button>
        <Button variant="secondary" onClick={() => setSmall(true)}>
          Open small modal (440)
        </Button>
        <Modal
          open={modal}
          onClose={() => setModal(false)}
          title="New task"
          footer={
            <>
              <Button variant="secondary" onClick={() => setModal(false)}>
                Cancel
              </Button>
              <Button onClick={() => setModal(false)}>Create task</Button>
            </>
          }
        >
          <div className="flex flex-col gap-5">
            <FormField label="Title" required helper="Keep it under 120 characters">
              {(field) => <Input {...field} placeholder="Review the Q3 invoice batch" />}
            </FormField>
            <FormField label="Description">
              {(field) => <Textarea {...field} placeholder="Cross-check the totals against the ledger." />}
            </FormField>
            <p className="text-sm text-text-muted">
              Tab cycles inside this dialog. Press Esc or the browser back button to close.
            </p>
          </div>
        </Modal>
        <Modal open={small} onClose={() => setSmall(false)} title="Delete &quot;Work&quot;?" size="sm"
          footer={
            <>
              <Button variant="secondary" onClick={() => setSmall(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={() => setSmall(false)}>
                Delete category
              </Button>
            </>
          }
        >
          <p className="text-body text-text-secondary">
            This category has 12 tasks. They will move to Uncategorized.
          </p>
        </Modal>
      </Row>

      <Row label="bottom sheet — slides up, drag the handle down to dismiss">
        <Button variant="secondary" onClick={() => setSheet(true)}>
          Open bottom sheet
        </Button>
        <BottomSheet open={sheet} onClose={() => setSheet(false)} title="Filters" showTitle>
          <div className="flex flex-col gap-4">
            <FormField label="Search">{(field) => <Input {...field} placeholder="Search tasks…" />}</FormField>
            <p className="text-sm text-text-muted">Filters apply live; there is no Apply button.</p>
            <Button fullWidth variant="secondary" onClick={() => setSheet(false)}>
              Done
            </Button>
          </div>
        </BottomSheet>
      </Row>

      <Row label="side panel — no scrim, page stays interactive, Esc / ✕ close">
        <Button variant="secondary" onClick={() => setPanel((p) => !p)}>
          {panel ? 'Close side panel' : 'Open side panel'}
        </Button>
        <div className="flex h-96 w-full overflow-hidden rounded-lg border border-border bg-background">
          <div className="flex-1 p-4 text-sm text-text-muted">
            The list lives here and stays clickable while the panel is open.
          </div>
          <SidePanel
            open={panel}
            onClose={() => setPanel(false)}
            label="Task details"
            actions={
              <>
                <IconButton icon={Pencil} label="Edit" />
                <IconButton icon={MoreHorizontal} label="More actions" />
              </>
            }
          >
            <div className="flex flex-col gap-4 p-5">
              <h3 className="text-h2 text-text-primary">Review the Q3 invoice batch</h3>
              <div className="flex gap-2">
                <StatusBadge status="IN_PROGRESS" />
                <PriorityBadge priority="HIGH" />
              </div>
              <Button fullWidth>Mark as completed</Button>
            </div>
          </SidePanel>
        </div>
      </Row>
    </Section>
  );
}
