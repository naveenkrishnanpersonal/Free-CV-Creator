import { expect, test, type Page } from '@playwright/test'
import { PDFDocument } from 'pdf-lib'

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

test('create, edit, preview, persist, export and switch paper', async ({ page }) => {
  const errors = collectErrors(page)
  await page.goto('/')

  await expect(page.getByText('Start here')).toBeVisible()
  await page.getByRole('button', { name: 'Create a CV' }).click()
  await expect(page).toHaveURL(/\/#\/cv\//)

  const editor = page.getByRole('main')
  await editor.getByLabel('Full name').fill('Amara Okafor')
  await editor.getByLabel('Headline').fill('Senior Product Designer')
  await editor.getByLabel('Email').fill('amara@example.com')
  await editor.getByLabel('City').fill('London')
  await editor.getByLabel('Country').fill('United Kingdom')

  await page.locator('aside').getByRole('button', { name: /^Experience/ }).click()
  await editor.getByLabel('Role', { exact: true }).fill('Senior Product Designer')
  await editor.getByLabel('Company', { exact: true }).fill('Northwind Payments')
  await editor.getByRole('button', { name: 'Add highlight' }).click()
  await editor
    .getByLabel('Highlight 2', { exact: true })
    .fill('Led the merchant dashboard redesign, lifting weekly active usage by 34%.')

  await page.getByLabel('CV name').fill('Amara — Product CV')
  await expect(page.getByText('Saved', { exact: true })).toBeVisible({ timeout: 6_000 })

  const preview = page.locator('.cv')
  await expect(preview).toContainText('Amara Okafor')
  await expect(preview).toContainText('Northwind Payments')
  await expect(preview).toContainText('34%')
  await expect(preview).toContainText('London')

  await page.getByLabel('Paper size').selectOption('Letter')
  const letterWidth = await page
    .locator('.cv-page')
    .evaluate((element) => Number.parseFloat(getComputedStyle(element).width))
  expect(Math.abs(letterWidth - 816)).toBeLessThan(1.5)
  await page.getByLabel('Paper size').selectOption('A4')

  await page.getByRole('button', { name: 'CV actions' }).click()
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('menuitem', { name: 'Export JSON' }).click(),
  ])
  expect(download.suggestedFilename()).toMatch(/\.cv\.json$/)

  await page.getByRole('button', { name: 'CV actions' }).click()
  await page.getByRole('menuitem', { name: 'Delete CV' }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.getByRole('button', { name: 'Cancel' }).click()

  await page.reload()
  await expect(page.getByRole('main').getByLabel('Full name')).toHaveValue('Amara Okafor')
  await expect(page.getByLabel('CV name')).toHaveValue('Amara — Product CV')
  await expect(page.locator('.cv')).toContainText('34%')

  await page.getByRole('button', { name: 'Back to library' }).click()
  await expect(page.getByText('Amara — Product CV')).toBeVisible()
  await expect(page.locator('.cv').first()).toContainText('Amara Okafor')

  expect(meaningfulErrors(errors)).toEqual([])
})

test('open the example, toggle visibility and use the mobile preview', async ({ page }) => {
  const errors = collectErrors(page)
  await page.goto('/')

  await page.getByRole('button', { name: 'Example', exact: true }).click()
  await expect(page).toHaveURL(/\/#\/cv\//)
  await expect(page.getByRole('main').getByLabel('Full name')).toHaveValue('Amara Okafor')
  await expect(page.locator('.cv')).toContainText('Royal College of Art')

  await page.getByRole('button', { name: 'Hide Awards' }).click()
  await expect(page.locator('.cv')).not.toContainText('D&AD Wood Pencil')
  await page.getByRole('button', { name: 'Show Awards' }).click()
  await expect(page.locator('.cv')).toContainText('D&AD Wood Pencil')

  await page.setViewportSize({ width: 390, height: 844 })
  await page.getByRole('button', { name: 'Open preview' }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await expect(dialog.locator('.cv')).toContainText('Amara Okafor')

  await dialog.locator('.cv').getByRole('button', { name: 'Add section' }).click()
  const addDialog = page.getByRole('dialog').filter({ hasText: 'Add a section' })
  await expect(addDialog).toBeVisible()
  await addDialog.getByRole('button', { name: /References/ }).click()
  await expect(dialog.locator('.cv')).toContainText('References')

  await page.getByRole('button', { name: 'Close preview' }).click()
  await expect(page.getByRole('dialog')).toBeHidden()

  expect(meaningfulErrors(errors)).toEqual([])
})

test('uploaded photo appears on the page and can be hidden', async ({ page }) => {
  const errors = collectErrors(page)
  await page.goto('/')
  await page.getByRole('button', { name: 'Create a CV' }).click()

  const editor = page.getByRole('main')
  await editor.getByLabel('Full name').fill('Amara Okafor')

  const png = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    'base64',
  )
  await editor.locator('input[type="file"]').setInputFiles({
    name: 'portrait.png',
    mimeType: 'image/png',
    buffer: png,
  })

  const photo = page.locator('.cv-photo img')
  await expect(photo).toBeVisible()
  await expect(photo).toHaveAttribute('src', /^data:image\/jpeg/)

  await page.getByRole('button', { name: 'Hide photo from CV' }).click()
  await expect(page.locator('.cv-photo')).toHaveCount(0)
  await page.getByRole('button', { name: 'Show photo on CV' }).click()
  await expect(page.locator('.cv-photo img')).toBeVisible()

  // Presets whose default header hides the photo must not lose an uploaded photo.
  await page.getByRole('button', { name: 'Change style' }).click()
  const dialog = page.getByRole('dialog')
  await dialog.getByRole('button', { name: 'Apply Executive style' }).click()
  await expect(page.locator('.cv-photo img')).toBeVisible()
  await dialog.getByRole('button', { name: 'Done' }).click()

  expect(meaningfulErrors(errors)).toEqual([])
})

test('style gallery offers every preset and applies one without losing content', async ({
  page,
}) => {
  const errors = collectErrors(page)
  await page.goto('/')
  await page.getByRole('button', { name: 'Example', exact: true }).click()

  await page.getByRole('button', { name: 'Change style' }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog.getByText('Choose a style')).toBeVisible()

  const cards = dialog.getByRole('button', { name: /^Apply .+ style$/ })
  await expect(cards).toHaveCount(20)

  await dialog.getByRole('button', { name: /^Sidebar/ }).click()
  await expect(cards).toHaveCount(5)
  await dialog.getByRole('button', { name: 'Apply Slate style' }).click()

  const livePreview = page.locator('.cv').first()
  await expect(livePreview).toHaveAttribute('data-layout', 'sidebar-right')
  await expect(livePreview).toContainText('D&AD Wood Pencil')
  await expect(livePreview).toContainText('Amara Okafor')

  await dialog.getByRole('button', { name: 'Done' }).click()
  await expect(page.getByRole('dialog')).toBeHidden()

  expect(meaningfulErrors(errors)).toEqual([])
})

test('edit directly on the page, remove a line and add a section', async ({ page }) => {
  const errors = collectErrors(page)
  await page.goto('/')
  await page.getByRole('button', { name: 'Example', exact: true }).click()

  const cv = page.getByTestId('editor-preview-stage').locator('.cv')
  const name = cv.locator('.cv-name')
  await name.click()
  await name.fill('Nia Mensah')
  await cv.locator('.cv-headline').click()
  await expect(page.getByRole('main').getByLabel('Full name')).toHaveValue('Nia Mensah')

  const bullets = cv.locator('.cv-bullet-line')
  const bulletCount = await bullets.count()
  const firstBullet = bullets.first()
  await firstBullet.hover()
  await firstBullet.getByRole('button', { name: /Remove highlight 1/ }).click()
  await expect(bullets).toHaveCount(bulletCount - 1)

  const firstEntry = cv.locator('.cv-entry').first()
  const entryBulletCount = await firstEntry.locator('.cv-bullet-line').count()
  const remainingFirst = firstEntry.locator('.cv-bullet-line').first()
  await remainingFirst.hover()
  await remainingFirst.getByRole('button', { name: /Add a line after highlight 1/ }).click()
  await expect(firstEntry.locator('.cv-bullet-line')).toHaveCount(entryBulletCount + 1)
  const newBullet = firstEntry.locator('.cv-bullet-line').nth(1)
  await newBullet.locator('.cv-editable').fill('Line written on the page')
  await cv.locator('.cv-headline').click()
  await expect(cv).toContainText('Line written on the page')

  await cv.getByRole('button', { name: 'Add section' }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog.getByText('Add a section')).toBeVisible()
  await dialog.getByRole('button', { name: /References/ }).click()
  await expect(cv.locator('[data-kind="references"]')).toContainText('References')

  expect(meaningfulErrors(errors)).toEqual([])
})

test('reorder sections freely: drag in the rail, move on the page, persists', async ({ page }) => {
  const errors = collectErrors(page)
  await page.goto('/')
  await page.getByRole('button', { name: 'Example', exact: true }).click()
  await expect(page).toHaveURL(/\/#\/cv\//)

  const cv = page.getByTestId('editor-preview-stage').locator('.cv')
  const order = async () =>
    cv.locator('.cv-section').evaluateAll((elements) =>
      elements.map((element) => element.getAttribute('data-kind')),
    )

  await expect.poll(order).toEqual([
    'summary',
    'experience',
    'education',
    'projects',
    'skills',
    'certifications',
    'awards',
    'languages',
  ])

  // Free drag: pull the last section up to the top of the rail.
  const source = page.getByRole('button', { name: 'Reorder Languages' })
  const target = page.getByRole('button', { name: 'Reorder Profile' })
  const from = await source.boundingBox()
  const to = await target.boundingBox()
  if (!from || !to) throw new Error('drag handles not found')

  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2)
  await page.mouse.down()
  await page.mouse.move(to.x + to.width / 2, to.y + to.height / 2 - 8, { steps: 16 })
  await page.mouse.up()

  await expect
    .poll(order)
    .toEqual([
      'languages',
      'summary',
      'experience',
      'education',
      'projects',
      'skills',
      'certifications',
      'awards',
    ])

  // On-page control: nudge it back down one place directly on the A4 page.
  const languages = cv.locator('.cv-section[data-kind="languages"]')
  await languages.hover()
  await page.getByRole('button', { name: 'Move Languages section down' }).click()

  await expect
    .poll(order)
    .toEqual([
      'summary',
      'languages',
      'experience',
      'education',
      'projects',
      'skills',
      'certifications',
      'awards',
    ])

  // The new order survives autosave and reload.
  await expect(page.getByText('Saved', { exact: true })).toBeVisible({ timeout: 6_000 })
  await page.reload()
  await expect
    .poll(order)
    .toEqual([
      'summary',
      'languages',
      'experience',
      'education',
      'projects',
      'skills',
      'certifications',
      'awards',
    ])

  expect(meaningfulErrors(errors)).toEqual([])
})

test('delete removes a CV permanently, even with pending edits', async ({ page }) => {
  const errors = collectErrors(page)
  await page.goto('/')

  await page.getByRole('button', { name: 'Example', exact: true }).click()
  await expect(page.getByRole('main').getByLabel('Full name')).toHaveValue('Amara Okafor')

  // Edit immediately before deleting so a pending autosave exists.
  await page.getByRole('main').getByLabel('Headline').fill('Product Design Lead')
  await page.getByRole('button', { name: 'CV actions' }).click()
  await page.getByRole('menuitem', { name: 'Delete CV' }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await dialog.getByRole('button', { name: 'Delete CV' }).click()

  await expect(page).toHaveURL(/#\/$/)
  await expect(page.getByText('Start here')).toBeVisible()

  await page.reload()
  await expect(page.getByText('Start here')).toBeVisible()

  expect(meaningfulErrors(errors)).toEqual([])
})

test('photo crop and position adjust on the page and persist', async ({ page }) => {
  const errors = collectErrors(page)
  await page.goto('/')
  await page.getByRole('button', { name: 'Create a CV' }).click()

  const editor = page.getByRole('main')
  await editor.getByLabel('Full name').fill('Amara Okafor')

  const png = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    'base64',
  )
  await editor.locator('input[type="file"]').setInputFiles({
    name: 'portrait.png',
    mimeType: 'image/png',
    buffer: png,
  })

  const photo = page.locator('.cv-photo img')
  await expect(photo).toBeVisible()

  await editor.getByLabel('Zoom', { exact: true }).focus()
  await page.keyboard.press('End')
  await expect(photo).toHaveAttribute('style', /scale\(3\)/)

  await editor.getByLabel('Horizontal', { exact: true }).focus()
  await page.keyboard.press('Home')
  await expect(photo).toHaveAttribute('style', /object-position: 0% 50%/)

  await editor.getByLabel('Vertical', { exact: true }).focus()
  await page.keyboard.press('End')
  await expect(photo).toHaveAttribute('style', /object-position: 0% 100%/)

  await expect(page.getByText('Saved', { exact: true })).toBeVisible({ timeout: 6_000 })
  await page.reload()
  await expect(photo).toHaveAttribute('style', /scale\(3\)/)
  await expect(photo).toHaveAttribute('style', /object-position: 0% 100%/)

  await editor.getByRole('button', { name: 'Reset photo crop' }).click()
  await expect(photo).toHaveAttribute('style', /scale\(1\)/)
  await expect(photo).toHaveAttribute('style', /object-position: 50% 50%/)

  expect(meaningfulErrors(errors)).toEqual([])
})

test('editing controls are visible without hovering', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Example', exact: true }).click()

  const sectionTools = page.locator('.cv-section-tools').first()
  expect(await sectionTools.evaluate((element) => getComputedStyle(element).opacity)).toBe('0.6')
  const tailButton = page.locator('.cv-section-tail-btn').first()
  expect(await tailButton.evaluate((element) => getComputedStyle(element).opacity)).toBe('0.6')
  await expect(page.getByRole('button', { name: 'Reorder Languages' })).toBeVisible()
})

test('design lab edits layout, type, colour and custom CSS live', async ({ page }) => {
  const errors = collectErrors(page)
  await page.goto('/')
  await page.getByRole('button', { name: 'Example', exact: true }).click()

  const cv = page.locator('.cv').first()
  await page.getByRole('button', { name: 'Customise design' }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog.getByRole('heading', { name: 'Design' })).toBeVisible()

  await dialog.getByLabel('Page layout').selectOption('sidebar-left')
  await expect(cv).toHaveAttribute('data-layout', 'sidebar-left')

  await dialog.getByRole('button', { name: 'Type', exact: true }).click()
  await dialog.getByLabel('Body size').focus()
  await page.keyboard.press('End')
  const fontSize = await cv.evaluate((element) =>
    Number.parseFloat(getComputedStyle(element).fontSize),
  )
  expect(Math.abs(fontSize - 18.67)).toBeLessThan(0.1)

  await dialog.getByRole('button', { name: 'Colour', exact: true }).click()
  await dialog.getByLabel('Accent hex value').fill('#b3261e')
  const accent = await cv.evaluate((element) =>
    (element as HTMLElement).style.getPropertyValue('--cv-accent'),
  )
  expect(accent.trim()).toBe('#b3261e')

  await dialog.getByRole('button', { name: 'Custom CSS', exact: true }).click()
  await dialog.getByLabel('Custom CSS').fill('.cv-name { letter-spacing: 2px; }')
  await expect(cv.locator('.cv-name')).toHaveCSS('letter-spacing', '2px')

  await dialog.getByRole('button', { name: 'Done' }).click()
  await expect(page.getByText('Saved', { exact: true })).toBeVisible({ timeout: 6_000 })
  await page.reload()
  await expect(page.locator('.cv').first()).toHaveAttribute('data-layout', 'sidebar-left')
  await expect(page.locator('.cv').first().locator('.cv-name')).toHaveCSS('letter-spacing', '2px')

  expect(meaningfulErrors(errors)).toEqual([])
})

test('PDF export prints the CV at paper size with no editor chrome', async ({ page }) => {
  const errors = collectErrors(page)
  await page.goto('/')
  await page.getByRole('button', { name: 'Example', exact: true }).click()

  await page.getByRole('button', { name: 'Export PDF' }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog.getByText('Export a PDF')).toBeVisible()
  await expect(dialog.getByText('Destination: Save as PDF')).toBeVisible()
  await expect(dialog.getByText('Background graphics: ON')).toBeVisible()

  await page.emulateMedia({ media: 'print' })
  await expect(page.locator('#root')).toBeHidden()
  await expect(page.locator('.print-layer .cv-name')).toBeVisible()
  await expect(page.locator('.print-layer .cv-tool')).toHaveCount(0)

  const a4 = await PDFDocument.load(
    await page.pdf({ preferCSSPageSize: true, printBackground: true }),
  )
  expect(a4.getPageCount()).toBeGreaterThanOrEqual(1)
  expect(Math.round(a4.getPage(0).getWidth())).toBe(595)
  expect(Math.round(a4.getPage(0).getHeight())).toBe(842)

  await page.emulateMedia({ media: 'screen' })
  await page.getByRole('button', { name: 'Close export' }).click()
  await page.getByLabel('Paper size').selectOption('Letter')
  await page.getByRole('button', { name: 'Export PDF' }).click()
  await page.emulateMedia({ media: 'print' })

  const letter = await PDFDocument.load(
    await page.pdf({ preferCSSPageSize: true, printBackground: true }),
  )
  expect(Math.round(letter.getPage(0).getWidth())).toBe(612)
  expect(Math.round(letter.getPage(0).getHeight())).toBe(792)

  expect(meaningfulErrors(errors)).toEqual([])
})
