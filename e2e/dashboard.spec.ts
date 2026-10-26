import { readFile } from 'node:fs/promises'
import { expect, test, type Page } from '@playwright/test'

function collectErrors(page: Page): string[] {
  const errors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  page.on('pageerror', (error) => errors.push(`PAGE ERROR: ${error.message}`))
  return errors
}

function meaningfulErrors(errors: string[]): string[] {
  return errors.filter(
    (error) =>
      !error.includes('Download the React DevTools') &&
      !error.toLowerCase().includes('favicon'),
  )
}

async function openExampleAndReturn(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Example', exact: true }).click()
  await expect(page).toHaveURL(/#\/cv\//)
  await expect(page.getByRole('main').getByLabel('Full name')).toHaveValue('Amara Okafor')
  await page.getByRole('button', { name: 'Back to library' }).click()
  await expect(page).toHaveURL(/#\/$/)
  await expect(page.getByRole('heading', { name: 'Recent CVs' })).toBeVisible()
}

test('dashboard searches, switches views, renames, backs up and restores', async ({ page }) => {
  const errors = collectErrors(page)
  await page.goto('/')

  await expect(page.getByText('Start here')).toBeVisible()
  await openExampleAndReturn(page)

  const workspace = page.getByRole('navigation', { name: 'Workspace' })
  await expect(workspace.getByRole('button', { name: /My CVs/ })).toContainText('1')

  const search = page.getByLabel('Search CVs')
  await search.fill('nothing matches this')
  await expect(page.getByText(/No CVs match/)).toBeVisible()
  await page.getByRole('button', { name: 'Reset search' }).click()
  await expect(page.getByLabel('Open Senior Product Designer CV')).toBeVisible()

  await page.getByRole('button', { name: 'List view' }).click()
  await expect(page.getByRole('button', { name: 'List view' })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await expect(page.getByLabel('Open Senior Product Designer CV')).toBeVisible()
  await page.getByRole('button', { name: 'Grid view' }).click()

  await page.getByLabel('Sort CVs').selectOption('name')
  await expect(page.getByLabel('Open Senior Product Designer CV')).toBeVisible()

  await page.getByRole('button', { name: 'Actions for Senior Product Designer CV' }).click()
  await page.getByRole('menuitem', { name: 'Rename' }).click()
  await expect(page.getByRole('heading', { name: 'Rename CV' })).toBeVisible()
  await page.getByLabel('CV name').fill('Renamed CV')
  await page.getByRole('button', { name: 'Save name' }).click()
  await expect(page.locator('#recent').getByText('Renamed CV')).toBeVisible()

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Export Backup', exact: true }).click(),
  ])
  expect(download.suggestedFilename()).toMatch(/^cv-studio-backup-.+\.json$/)
  const backupPath = await download.path()
  expect(backupPath).not.toBeNull()
  const payload = JSON.parse(await readFile(backupPath as string, 'utf8')) as {
    format: string
    documents: { title: string }[]
  }
  expect(payload.format).toBe('cv-studio-backup')
  expect(payload.documents).toHaveLength(1)
  expect(payload.documents[0]?.title).toBe('Renamed CV')

  const chooserPromise = page.waitForEvent('filechooser')
  await page.getByRole('button', { name: 'Restore Backup', exact: true }).click()
  const chooser = await chooserPromise
  await chooser.setFiles(backupPath as string)
  await expect(page.getByText('1 CV restored.')).toBeVisible()
  await expect(page.locator('#recent').getByLabel('Open Renamed CV')).toHaveCount(2)

  await page.getByRole('button', { name: 'Actions for Renamed CV' }).first().click()
  await page.getByRole('menuitem', { name: 'Delete' }).click()
  await page
    .getByRole('dialog')
    .filter({ hasText: 'Delete “Renamed CV”?' })
    .getByRole('button', { name: 'Delete CV' })
    .click()
  await expect(page.locator('#recent').getByLabel('Open Renamed CV')).toHaveCount(1)

  expect(meaningfulErrors(errors)).toEqual([])
})

test('template dialog, settings theme persistence and customize intent work', async ({ page }) => {
  const errors = collectErrors(page)
  await page.goto('/')

  await page.getByRole('button', { name: 'Browse Templates', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Templates' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Use Ink & Paper template' })).toBeVisible()
  await page.getByRole('button', { name: 'Use Ink & Paper template' }).click()
  await expect(page).toHaveURL(/#\/cv\//)
  await expect(page.getByRole('main').getByLabel('Full name')).toBeVisible()

  await page.getByRole('button', { name: 'Back to library' }).click()
  await expect(page).toHaveURL(/#\/$/)

  await page.getByRole('button', { name: 'Settings', exact: true }).first().click()
  await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible()
  await expect(page.getByText('Local storage', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Light' }).click()
  await expect(page.locator('html')).not.toHaveClass(/dark/)
  await page.reload()
  await expect(page.locator('html')).not.toHaveClass(/dark/)

  await page
    .getByRole('navigation', { name: 'Workspace' })
    .getByRole('button', { name: 'Settings' })
    .click()
  await page.getByRole('button', { name: 'Dark' }).click()
  await expect(page.locator('html')).toHaveClass(/dark/)
  await page.getByRole('button', { name: 'Close settings' }).click()

  await page.getByRole('button', { name: /^Customize/ }).click()
  await expect(page.getByRole('heading', { name: 'Design' })).toBeVisible()

  expect(meaningfulErrors(errors)).toEqual([])
})

test('desktop dashboard fits without page scroll and the mobile drawer opens settings', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1512, height: 950 })
  await page.goto('/')
  await expect(page.getByText('Start here')).toBeVisible()

  const fit = await page.evaluate(() => {
    const main = document.getElementById('dashboard-main')
    return {
      horizontal:
        document.documentElement.scrollWidth - document.documentElement.clientWidth,
      pageVertical: document.documentElement.scrollHeight - window.innerHeight,
      mainVertical: main ? main.scrollHeight - main.clientHeight : -1,
    }
  })
  expect(fit.horizontal).toBe(0)
  expect(fit.pageVertical).toBe(0)
  expect(fit.mainVertical).toBe(0)

  await page.setViewportSize({ width: 390, height: 844 })
  await page.getByRole('button', { name: 'Open navigation' }).click()
  const drawer = page.getByRole('dialog')
  await expect(drawer).toBeVisible()
  await expect(drawer.getByRole('button', { name: 'Home' })).toBeVisible()
  await drawer.getByRole('button', { name: 'Settings' }).click()
  await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Close settings' })).toBeVisible()
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    ),
  ).toBe(0)
})
