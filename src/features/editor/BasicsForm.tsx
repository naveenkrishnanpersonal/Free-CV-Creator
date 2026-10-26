import { Plus, Trash2, UserRound } from 'lucide-react'
import { PROFILE_NETWORKS } from '@/lib/constants'
import { useDocStore } from '@/store/docStore'
import { Button } from '@/components/ui/Button'
import { Field, Input, LabeledInput } from '@/components/ui/Field'
import { PhotoField } from './fields/PhotoField'

export function BasicsForm() {
  const basics = useDocStore((state) => state.doc?.basics)
  const updateBasics = useDocStore((state) => state.updateBasics)
  const addProfile = useDocStore((state) => state.addProfile)
  const updateProfile = useDocStore((state) => state.updateProfile)
  const removeProfile = useDocStore((state) => state.removeProfile)

  if (!basics) return null

  return (
    <div className="animate-fade-up">
      <div className="flex items-start gap-3 border-b border-line pb-5">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent">
          <UserRound size={17} />
        </span>
        <div className="min-w-0">
          <div className="text-[10.5px] font-semibold tracking-[0.11em] text-faint uppercase">
            Header
          </div>
          <h1 className="mt-0.5 font-display text-[26px] leading-tight text-ink">Who you are</h1>
          <p className="mt-1 text-[12.5px] leading-relaxed text-muted">
            The first twelve words a recruiter reads. Keep them concrete.
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-5">
        <PhotoField />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <LabeledInput
            label="Full name"
            placeholder="Amara Okafor"
            value={basics.name}
            onChange={(event) =>
              updateBasics((draft) => {
                draft.name = event.target.value
              }, 'name')
            }
            autoComplete="name"
          />
          <LabeledInput
            label="Headline"
            placeholder="Senior Product Designer"
            value={basics.headline}
            onChange={(event) =>
              updateBasics((draft) => {
                draft.headline = event.target.value
              }, 'headline')
            }
          />
        </div>

        <div>
          <div className="mb-2 flex items-baseline justify-between">
            <h2 className="text-[12px] font-semibold text-ink">Contact</h2>
            <span className="text-[10.5px] text-faint">Shown in the CV header</span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <LabeledInput
              label="Email"
              type="email"
              inputMode="email"
              placeholder="you@example.com"
              value={basics.email}
              onChange={(event) =>
                updateBasics((draft) => {
                  draft.email = event.target.value
                }, 'email')
              }
              autoComplete="email"
            />
            <LabeledInput
              label="Phone"
              type="tel"
              placeholder="+44 20 7946 0821"
              value={basics.phone}
              onChange={(event) =>
                updateBasics((draft) => {
                  draft.phone = event.target.value
                }, 'phone')
              }
              autoComplete="tel"
            />
            <LabeledInput
              label="City"
              placeholder="London"
              value={basics.city}
              onChange={(event) =>
                updateBasics((draft) => {
                  draft.city = event.target.value
                }, 'city')
              }
              autoComplete="address-level2"
            />
            <LabeledInput
              label="Country"
              placeholder="United Kingdom"
              value={basics.country}
              onChange={(event) =>
                updateBasics((draft) => {
                  draft.country = event.target.value
                }, 'country')
              }
              autoComplete="country-name"
            />
            <LabeledInput
              label="Website"
              placeholder="yourname.com"
              className="sm:col-span-2"
              value={basics.website}
              onChange={(event) =>
                updateBasics((draft) => {
                  draft.website = event.target.value
                }, 'website')
              }
              autoComplete="url"
            />
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-baseline justify-between">
            <h2 className="text-[12px] font-semibold text-ink">Links</h2>
            <span className="text-[10.5px] text-faint">LinkedIn, portfolio, GitHub</span>
          </div>
          <div className="space-y-2">
            {basics.profiles.map((profile) => (
              <div key={profile.id} className="rounded-lg border border-line bg-surface p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="text-[11.5px] font-medium text-muted">
                    {profile.network || 'Profile'}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => removeProfile(profile.id)}
                    aria-label={`Remove ${profile.network || 'profile'} link`}
                  >
                    <Trash2 size={13} />
                  </Button>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-[124px_minmax(0,1fr)]">
                  <Field label="Network">
                    <select
                      value={profile.network}
                      onChange={(event) =>
                        updateProfile(profile.id, (draft) => {
                          draft.network = event.target.value
                        })
                      }
                      className="h-9 w-full rounded-md border border-line bg-surface px-2 text-[12.5px] outline-none focus:border-accent"
                      aria-label="Network"
                    >
                      {PROFILE_NETWORKS.map((network) => (
                        <option key={network} value={network}>
                          {network}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Label">
                    <Input
                      value={profile.label}
                      placeholder="in/yourname"
                      onChange={(event) =>
                        updateProfile(profile.id, (draft) => {
                          draft.label = event.target.value
                        }, 'label')
                      }
                    />
                  </Field>
                  <div className="sm:col-span-2">
                    <Field label="URL">
                      <Input
                        value={profile.url}
                        placeholder="https://linkedin.com/in/yourname"
                        inputMode="url"
                        onChange={(event) =>
                          updateProfile(profile.id, (draft) => {
                            draft.url = event.target.value
                          }, 'url')
                        }
                      />
                    </Field>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Button
            variant="secondary"
            size="sm"
            className="mt-2 w-full border-dashed"
            onClick={() => addProfile()}
          >
            <Plus size={13} /> Add link
          </Button>
        </div>
      </div>
    </div>
  )
}
