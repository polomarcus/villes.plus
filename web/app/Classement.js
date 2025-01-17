import ScoreLegend from '@/ScoreLegend'
import Link from 'next/link'
import algorithmVersion from '../../algorithmVersion'
import CityResult from './CityResult'
import {
	ClassementWrapper,
	CounterLevel,
	NewCityLink,
	DateBlock,
	Loading,
	Ol,
} from './ClassementUI'
import Logo from './Logo'

// TODO this component should probably not be common for both cyclable & pietonnes, but rather juste share UI components and socket hooks

export const normalizedScores = (data) => {
	const million = 1000 * 1000
	const pedestrianArea = data.pedestrianArea / million,
		relativeArea = data.relativeArea / million,
		area = data.geoAPI.surface / 100, // looks to be defined in the 'hectares' unit
		percentage = (pedestrianArea / relativeArea) * 100
	return { pedestrianArea, area, relativeArea, percentage }
}

export function Classement({ cyclable, data, text, level, gridView }) {
	const villes = data

	let villesEntries = Object.entries(villes)

	const counterLevel =
		level &&
		(level === 'metropoles'
			? 'communes'
			: level === 'communes'
			? 'metropoles'
			: false)

	return (
		<>
			<Logo animate cyclable={cyclable} />
			<ClassementWrapper gridView={gridView}>
				<h2>
					{text ||
						(cyclable
							? `Quelles ${level} françaises sont les plus cyclables ?`
							: 'Quelles grandes villes françaises sont les plus piétonnes ?')}
				</h2>
				{level === 'prefectures' && (
					<small>
						Les plus grandes préfectures sont à retrouver dans le{' '}
						<Link href="/cyclables/grandes-villes">
							classement des grandes communes
						</Link>
					</small>
				)}
				{counterLevel && cyclable && (
					<CounterLevel>
						<Link href={`/cyclables/${counterLevel}`}>
							<img src={`/${counterLevel}.svg`} />{' '}
							<div>Voir le classement des {counterLevel}</div>
						</Link>
					</CounterLevel>
				)}
				<DateBlock>
					🗓️{' '}
					{new Date().toLocaleString('fr-FR', {
						month: 'long',
						year: 'numeric',
					})}{' '}
					{cyclable ? (
						<Link href="/explications/cyclables">algo {algorithmVersion}</Link>
					) : (
						<Link href="/explications/pietonnes">algo v1</Link>
					)}
					<Link
						href={`/${
							cyclable ? 'cyclables' : 'pietonnes'
						}/${level}/?gridView=${!gridView}`}
					>
						🪟 vue grille
					</Link>
				</DateBlock>
				{villesEntries.length === 0 && (
					<Loading>Chargement en cours ⏳</Loading>
				)}

				{cyclable && <ScoreLegend scores={villesEntries} />}
				{
					<Ol $gridView={gridView}>
						{villesEntries
							.map(([ville, data]) => {
								if (cyclable) return [ville, data]
								if (!data || !data.geoAPI)
									return [ville, { percentage: -Infinity, status: data.status }]
								return [ville, { ...data, ...normalizedScores(data) }]
							})
							.sort(([, v1], [, v2]) =>
								cyclable
									? v2?.score - v1?.score
									: v2?.percentage - v1?.percentage
							)
							.map(([ville, data], i) => {
								return (
									<CityResult
										key={ville}
										{...{ gridView, ville, cyclable, data, i }}
									/>
								)
							})}
					</Ol>
				}
			</ClassementWrapper>
			<NewCityLink />
		</>
	)
}
