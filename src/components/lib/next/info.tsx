import { Component, ReactElement, SyntheticEvent } from "react";
import { EventEmitter } from "events"
import gsap from "gsap"
import styles from "src/styles/lib/info.module.scss"

interface Props {
	title: string,
	details: {
		type: "link" | "text",
		text: string,
		link?: string
	}[][],
	shareText: string,
	shareUrl: string,
	buttonColor?: string
}

export default class Info extends Component<Props> {

	public static events: {[key:string]: string} = {
		appear: "appear",
		disappear: "disappear"
	}
	public static defaultProps: Props = {
		title: "",
		details: [],
		shareText: "",
		shareUrl: "",
		buttonColor: "#ffffff"
	}

	private _bg: HTMLElement | null = null
	private _contents: HTMLElement | null = null
	private _fadeTween: GSAPTimeline | null = null
	public events: EventEmitter = new EventEmitter()

	public appear(): void {
		if(this._fadeTween != null) this._fadeTween.kill()
		this._fadeTween = gsap.timeline()
		this._fadeTween.to(this._bg, {alpha: 1, duration: 0.3})
		this._fadeTween.to(this._contents, {alpha: 1, duration: 0.3})
		if(this._bg!.classList.contains(styles.invisible)) this._bg!.classList.remove(styles.invisible)
		this.events.emit(Info.events.appear)
	}

	public disappear(): void {
		if(this._fadeTween != null) this._fadeTween.kill()
		this._fadeTween = gsap.timeline()
		this._fadeTween.to(this._contents, {alpha: 0, duration: 0.3})
		this._fadeTween.to(this._bg!, {alpha: 0, duration: 0.3})
		if(!this._bg!.classList.contains(styles.invisible)) this._bg!.classList.add(styles.invisible)
		this.events.emit(Info.events.disappear)
	}

	private _onReadyBG = (node: HTMLElement): void => {
		if(!node) return
		this._bg = node
		gsap.set(this._bg, {alpha: 0})
		this._bg.classList.add(styles.invisible)
	}

	private _onReadyContents = (node: HTMLElement): void => {
		if(!node) return
		this._contents = node
		gsap.set(this._contents, {alpha: 0})
	}

	/**
	 * ボタンクリックでappear
	 * @param e
	 */
	private _onClickButton = (e: SyntheticEvent): void => {
		if(e && e.cancelable) e.preventDefault()
		this.appear()
	}

	/**
	 * 背景クリックでdisappear
	 * @param e
	 */
	private _onClickBG = (e: SyntheticEvent): void => {
		if(e && e.cancelable) e.preventDefault()
		this.disappear()
	}

	/**
	 * コンテンツのイベントが伝播してBGのクリックイベントが発生するのを禁止
	 * @param e
	 */
	private _onClickContents = (e: SyntheticEvent): void => {
		if(e) e.stopPropagation()
	}

	render(): ReactElement {

		return (
			<>
				<section className={`${styles.container} ${styles.invisible}`} ref={this._onReadyBG} onClick={this._onClickBG}>
					<article className={styles.info} ref={this._onReadyContents} onClick={this._onClickContents}>
						<h2 className={styles.info__title}>{this.props.title}</h2>
						<div className={styles.info__author}>
							{this.props.details.map((data, i) => {
								return(
									<p className={styles.info__author__detail} key={i}>
										{data.map((d, _i) => {
											if(d.type == "text")
												return <span key={_i}>{d.text}&nbsp;</span>
											else if (d.type == "link")
												return <a key={_i} href={d.link} target="_blank" rel="noreferrer">{d.text}&nbsp;</a>
										})}
									</p>
								)
							})}
						</div>
						<div className={styles.info__twitter}>
							<a className={styles.info__twitter__follow} href="https://twitter.com/intent/follow?original_referer=https%3A%2F%2Fpublish.twitter.com%2F&ref_src=twsrc%5Etfw%7Ctwcamp%5Ebuttonembed%7Ctwterm%5Efollow%7Ctwgr%5Eaualrxse&screen_name=aualrxse" target="_blank" rel="noreferrer">
								<img src="/images/ico-tw-wh.svg" alt="twitter" />
							</a>
							<a className={styles.info__twitter__share} href="https://twitter.com/intent/follow?original_referer=https%3A%2F%2Fpublish.twitter.com%2F&ref_src=twsrc%5Etfw%7Ctwcamp%5Ebuttonembed%7Ctwterm%5Efollow%7Ctwgr%5Eaualrxse&screen_name=aualrxse" target="_blank" rel="noreferrer">follow</a>
							<a className={styles.info__twitter__share} href={"https://twitter.com/intent/tweet?text=\n"+this.props.shareText+"&url="+this.props.shareUrl} target="_blank" rel="noreferrer">share</a>
						</div>
						<footer className={styles.info__footer}>
							<p>© 2021 / Arata matsumoto</p>
						</footer>
					</article>
				</section>
				<a
					onClick={this._onClickButton}
					className={styles.button} href="#"
					style={{color: this.props.buttonColor, borderColor: this.props.buttonColor}}
				>i</a>
			</>
		)

	}

}