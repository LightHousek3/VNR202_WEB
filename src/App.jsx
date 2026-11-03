import { useEffect, useMemo, useRef, useState } from 'react';
import {
    ArrowLeft,
    ArrowRight,
    ArrowUpRight,
    BookOpen,
    Building2,
    ChartNoAxesCombined,
    Check,
    ChevronDown,
    CircleHelp,
    Compass,
    FileText,
    Flag,
    Globe2,
    GraduationCap,
    Landmark,
    LibraryBig,
    Lightbulb,
    MessageCircle,
    RotateCcw,
    Route,
    Send,
    ShieldAlert,
    ShieldCheck,
    Sparkles,
    Sprout,
    UsersRound,
    X,
} from 'lucide-react';
import {
    afterCongress,
    chatSuggestions,
    dossiers,
    knowledgeMap,
    reviewQuestions,
    sourceTypeLabels,
    textbook,
} from './data.js';

const storageKeys = {
    choices: 'vnr202-delegate-choices-v2',
    completed: 'vnr202-completed-dossiers-v2',
};

const iconMap = {
    Building2,
    ChartNoAxesCombined,
    Compass,
    Globe2,
    Landmark,
    LibraryBig,
    Lightbulb,
    Route,
    ShieldCheck,
    Sprout,
    UsersRound,
};

function readSaved(key, fallback) {
    try {
        const value = window.localStorage.getItem(key);
        return value ? JSON.parse(value) : fallback;
    } catch {
        return fallback;
    }
}

function Icon({ name, size = 20, ...props }) {
    const Component = iconMap[name] || BookOpen;
    return <Component size={size} strokeWidth={1.8} aria-hidden="true" {...props} />;
}

function SourceType({ type = 'giao trinh' }) {
    return (
        <span className={'source-type source-type--' + type.replaceAll(' ', '-')}>
            {sourceTypeLabels[type] || type}
        </span>
    );
}

function SourceList({ sources, compact = false }) {
    if (!sources?.length) return null;
    return (
        <div className={compact ? 'source-list source-list--compact' : 'source-list'}>
            <div className="source-list__heading">
                <BookOpen size={14} /> Nguồn đối chiếu
            </div>
            {sources.map((item) => (
                <article className="source-card" key={item.id}>
                    <div className="source-card__meta">
                        <b>{item.file}</b>
                        <span>
                            {item.chapter} · trang in {item.printedPage}
                        </span>
                        <SourceType type={item.sourceType} />
                    </div>
                    <p>“{item.excerpt}”</p>
                    {item.note && <small>{item.note}</small>}
                </article>
            ))}
        </div>
    );
}

function Header({ screen, progress, onHome, onSummary, onOpenChat }) {
    return (
        <header className="topbar">
            <button className="brand" onClick={onHome} aria-label="Về sảnh Đại hội">
                <span className="brand__seal">
                    <Icon name="Landmark" size={21} />
                </span>
                <span className="brand__copy">
                    <b>PHÒNG HỌP ĐẠI BIỂU</b>
                    <small>HỌC TẬP CÙNG ĐẠI HỘI IX</small>
                </span>
            </button>
            <div
                className="topbar__center"
                aria-label={'Đã hoàn thành ' + progress + ' trên ' + dossiers.length + ' tờ trình'}
            >
                <span className="topbar__progress-label">HÀNH TRÌNH ĐẠI BIỂU</span>
                <div className="progress-track">
                    <span style={{ width: (progress / dossiers.length) * 100 + '%' }} />
                </div>
                <b>
                    {String(progress).padStart(2, '0')} / {String(dossiers.length).padStart(2, '0')}
                </b>
            </div>
            <nav className="topbar__actions" aria-label="Điều hướng">
                <button
                    className={screen === 'hall' ? 'nav-link is-current' : 'nav-link'}
                    onClick={onHome}
                >
                    Sảnh đại hội
                </button>
                <button
                    className={screen === 'summary' ? 'nav-link is-current' : 'nav-link'}
                    onClick={onSummary}
                >
                    Tổng kết
                </button>
                <button className="chat-shortcut" onClick={onOpenChat}>
                    <MessageCircle size={16} /> Hỏi Agent
                </button>
            </nav>
        </header>
    );
}

function SimulationNotice({ compact = false }) {
    return (
        <div
            className={
                compact ? 'simulation-notice simulation-notice--compact' : 'simulation-notice'
            }
            role="note"
        >
            <ShieldAlert size={17} aria-hidden="true" />
            <p>
                <b>Mô phỏng thảo luận học tập.</b> Lựa chọn của bạn không phải biên bản bỏ phiếu
                thật và không đại diện cho số liệu biểu quyết tại Đại hội IX.
            </p>
        </div>
    );
}

function ProgressStrip({ active, stage }) {
    const steps = [
        ['read', 'Đọc tóm tắt'],
        ['choose', 'Chọn ưu tiên'],
        ['compare', 'Đối chiếu'],
    ];
    const order = ['read', 'choose', 'compare'];
    return (
        <ol className="step-strip" aria-label="Ba bước của tờ trình">
            {steps.map(([id, label], index) => {
                const done = order.indexOf(stage) > index;
                const current = stage === id;
                return (
                    <li
                        key={id}
                        className={(current ? 'is-current ' : '') + (done ? 'is-done' : '')}
                        aria-current={current ? 'step' : undefined}
                    >
                        <span>{done ? <Check size={14} /> : '0' + (index + 1)}</span>
                        <b>{label}</b>
                    </li>
                );
            })}
        </ol>
    );
}

function DossierTile({ dossier, index, completed, selected, onClick }) {
    const style = { '--card-index': index };
    return (
        <button
            className={
                'dossier-tile theme-' +
                dossier.theme +
                ' pattern-' +
                dossier.pattern +
                (selected ? ' is-selected' : '')
            }
            style={style}
            onClick={onClick}
        >
            <span className="dossier-tile__top">
                <span className="dossier-tile__number">{dossier.number}</span>
                {completed ? (
                    <span className="tile-done">
                        <Check size={13} /> Đã đối chiếu
                    </span>
                ) : (
                    <span className="tile-open">Tờ trình</span>
                )}
            </span>
            <span className="dossier-tile__icon">
                <Icon name={dossier.icon} size={24} />
            </span>
            <b className="dossier-tile__title">{dossier.title}</b>
            <span className="dossier-tile__footer">
                <span>{dossier.depth || 'Thảo luận đại hội'}</span>
                <ArrowUpRight size={17} />
            </span>
        </button>
    );
}

function AfterCongressPanel() {
    const [expanded, setExpanded] = useState(false);
    return (
        <section className="after-section" aria-labelledby="after-title">
            <div className="after-section__heading">
                <div>
                    <span className="eyebrow eyebrow--dark">
                        <span className="eyebrow__dot" /> MỤC RIÊNG · KHÔNG THUỘC TỜ TRÌNH ĐẠI HỘI
                    </span>
                    <h2 id="after-title">Triển khai sau Đại hội IX</h2>
                    <p>
                        Các mốc dưới đây là hoạt động trong toàn khóa IX, được giáo trình đặt sau
                        nội dung Đại hội IX.
                    </p>
                </div>
                <button
                    className="text-button"
                    onClick={() => setExpanded(!expanded)}
                    aria-expanded={expanded}
                >
                    {expanded ? 'Thu gọn' : 'Mở mục riêng'}{' '}
                    <ChevronDown className={expanded ? 'rotate' : ''} size={17} />
                </button>
            </div>
            {expanded && (
                <div className="after-grid">
                    {afterCongress.entries.map((entry, index) => (
                        <article
                            className="after-card"
                            key={entry.id}
                            style={{ '--card-index': index }}
                        >
                            <div className="after-card__head">
                                <span className="after-card__icon">
                                    <Icon name={entry.icon} size={18} />
                                </span>
                                <span>{entry.year}</span>
                            </div>
                            <h3>{entry.title}</h3>
                            <SourceType type={entry.sourceType} />
                            <p>{entry.text}</p>
                            <SourceList sources={entry.sources} compact />
                        </article>
                    ))}
                </div>
            )}
            <div className="after-section__boundary">
                <span /> Nguồn thuộc giai đoạn triển khai 2002–2004 <span />
            </div>
        </section>
    );
}

function Hall({ completed, selectedId, onOpenDossier, onStart, onSummary, onAsk }) {
    const nextDossier = dossiers.find((item) => !completed.includes(item.id)) || dossiers[0];
    return (
        <main className="page-shell page-enter" key="hall">
            <section className="hero-room" aria-labelledby="hero-title">
                <div className="hero-room__copy">
                    <div className="eyebrow">
                        <span className="eyebrow__dot" /> NHÓM 3 · LỊCH SỬ ĐẢNG CỘNG SẢN VIỆT NAM
                    </div>
                    <h1 id="hero-title">
                        Một Đại hội.
                        <br />
                        <em>Chín tờ trình.</em>
                    </h1>
                    <p className="hero-room__lede">
                        Bước vào phòng họp, chọn điều bạn ưu tiên trước khi mở hồ sơ về hướng Đại
                        hội IX đã xác định.
                    </p>
                    <div className="hero-room__actions">
                        <button className="button-primary" onClick={onStart}>
                            {completed.length ? 'Tiếp tục hành trình' : 'Bước vào phòng họp'}{' '}
                            <ArrowRight size={17} />
                        </button>
                        <button className="button-quiet" onClick={onSummary}>
                            Xem biên bản của tôi <ArrowUpRight size={15} />
                        </button>
                    </div>
                    <SimulationNotice />
                </div>
                <div className="assembly-art" aria-label="Sơ đồ minh họa phòng họp đại biểu">
                    <div className="assembly-art__ceiling" />
                    <div className="assembly-art__rings">
                        <i />
                        <i />
                        <i />
                    </div>
                    <div className="assembly-art__emblem">
                        <Icon name="Landmark" size={40} />
                        <small>PHÒNG HỌP</small>
                        <b>IX</b>
                    </div>
                    <div className="assembly-art__desk">
                        <span />
                        <span />
                        <span />
                        <span />
                        <span />
                    </div>
                    <div className="assembly-art__seat-row">
                        <i />
                        <i />
                        <i />
                        <i />
                        <i />
                        <i />
                        <i />
                    </div>
                    <div className="assembly-art__floor" />
                    <span className="art-note art-note--left">
                        2001 <i /> 2010
                    </span>
                    <span className="art-note art-note--right">
                        VĂN KIỆN · THẢO LUẬN · ĐỐI CHIẾU
                    </span>
                    <small className="assembly-art__caption">SƠ ĐỒ MINH HỌA TRANG TRÍ</small>
                </div>
            </section>
            <div className="hall-question">
                <span className="hall-question__mark">
                    <CircleHelp size={20} />
                </span>
                <div>
                    <small>CÂU HỎI TRUNG TÂM</small>
                    <p>
                        Làm thế nào tiếp tục đổi mới để phát triển đất nước vững chắc trong thời đại
                        mới?
                    </p>
                </div>
                <span className="hall-question__meta">
                    9 hồ sơ <i /> 3 bước mỗi hồ sơ
                </span>
            </div>
            <section className="dossier-section" aria-labelledby="dossier-heading">
                <div className="section-heading-row">
                    <div>
                        <span className="eyebrow eyebrow--dark">HÀNH TRÌNH THẢO LUẬN</span>
                        <h2 id="dossier-heading">Các tờ trình</h2>
                        <p>Đọc nội dung, chọn hướng ưu tiên, rồi mới mở phần đối chiếu.</p>
                    </div>
                    <button className="outline-button" onClick={onStart}>
                        <Flag size={16} /> Bắt đầu với {nextDossier.number}
                    </button>
                </div>
                <div className="dossier-grid">
                    {dossiers.map((dossier, index) => (
                        <DossierTile
                            key={dossier.id}
                            dossier={dossier}
                            index={index}
                            completed={completed.includes(dossier.id)}
                            selected={selectedId === dossier.id}
                            onClick={() => onOpenDossier(dossier.id)}
                        />
                    ))}
                </div>
            </section>
            <AfterCongressPanel />
            <section className="hall-source-note">
                <FileText size={17} />
                <p>
                    <b>Nguồn học tập:</b> {textbook.printedTitle}, ấn bản 2021. Mỗi thẻ nguồn ghi
                    trang in để bạn mở đúng đoạn trong PDF.
                </p>
                <button
                    onClick={() => onAsk('Giáo trình xác nhận năm in nào trên trang tên sách?')}
                >
                    Hỏi về nguồn <ArrowUpRight size={14} />
                </button>
            </section>
        </main>
    );
}

function ChoiceList({ dossier, choice, onSelect }) {
    return (
        <fieldset className="choice-list">
            <legend>
                Chọn hướng ưu tiên của bạn <SourceType type="mo phong" />
            </legend>
            <div className="choice-list__items">
                {dossier.choices.map((option, index) => (
                    <label
                        className={'choice-card' + (choice === option.id ? ' is-chosen' : '')}
                        key={option.id}
                    >
                        <input
                            type="radio"
                            name={'choice-' + dossier.id}
                            value={option.id}
                            checked={choice === option.id}
                            onChange={() => onSelect(option.id)}
                        />
                        <span className="choice-card__index">0{index + 1}</span>
                        <span className="choice-card__copy">
                            <b>{option.title}</b>
                            <small>{option.detail}</small>
                        </span>
                        <span className="choice-card__check">
                            <Check size={16} />
                        </span>
                    </label>
                ))}
            </div>
        </fieldset>
    );
}

function DossierRoom({
    dossier,
    stage,
    choice,
    onChoose,
    onStage,
    onBack,
    onFinish,
    isCompleted,
    index,
}) {
    const stepPanelRef = useRef(null);
    const previousStage = useRef(stage);
    const selected = dossier.choices.find((item) => item.id === choice);
    useEffect(() => {
        if (previousStage.current === stage) return;
        previousStage.current = stage;
        const frame = window.requestAnimationFrame(() => {
            const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            stepPanelRef.current?.scrollIntoView({
                behavior: reduceMotion ? 'auto' : 'smooth',
                block: 'start',
            });
        });
        return () => window.cancelAnimationFrame(frame);
    }, [stage]);
    return (
        <main
            className={'dossier-room page-shell page-enter theme-' + dossier.theme}
            key={dossier.id}
        >
            <div className="room-toolbar">
                <button className="back-button" onClick={onBack}>
                    <ArrowLeft size={16} /> Về danh sách tờ trình
                </button>
                <span>
                    HỒ SƠ {dossier.number} / {String(dossiers.length).padStart(2, '0')}
                </span>
            </div>
            <ProgressStrip active={index} stage={stage} />
            <section className={'dossier-cover pattern-' + dossier.pattern}>
                <div className="dossier-cover__copy">
                    <span className="eyebrow eyebrow--dark">
                        <span className="eyebrow__dot" /> TỜ TRÌNH {dossier.number}
                    </span>
                    <h1>{dossier.title}</h1>
                    {dossier.depth && (
                        <span className="depth-ribbon">
                            <Sparkles size={14} /> {dossier.depth}
                        </span>
                    )}
                </div>
                <div className="dossier-cover__art">
                    <span className="cover-art__halo" />
                    <span className="cover-art__icon">
                        <Icon name={dossier.icon} size={41} />
                    </span>
                    <b>{dossier.number}</b>
                    <small>ĐẠI HỘI IX</small>
                </div>
            </section>
            <SimulationNotice compact />
            {stage === 'read' && (
                <section
                    ref={stepPanelRef}
                    className="step-panel read-panel"
                    aria-labelledby="read-heading"
                >
                    <div className="panel-kicker">
                        <span>01</span>
                        <b>Đọc tóm tắt theo giáo trình</b>
                        <SourceType type={dossier.summary.sourceType} />
                    </div>
                    <h2 id="read-heading">Điều cần có trên bàn thảo luận</h2>
                    <p className="summary-copy">{dossier.summary.text}</p>
                    <div className="summary-foot">
                        <BookOpen size={16} />
                        <span>{textbook.chapter}</span>
                        <SourceType type="giao trinh" />
                    </div>
                    <SourceList sources={dossier.sources} />
                    <div className="step-actions">
                        <span>Đọc xong? Bước tiếp theo sẽ chỉ ghi nhận lựa chọn của bạn.</span>
                        <button className="button-primary" onClick={() => onStage('choose')}>
                            Đến phần lựa chọn <ArrowRight size={17} />
                        </button>
                    </div>
                </section>
            )}
            {stage === 'choose' && (
                <section
                    ref={stepPanelRef}
                    className="step-panel choose-panel"
                    aria-labelledby="choose-heading"
                >
                    <div className="panel-kicker">
                        <span>02</span>
                        <b>Chọn hướng ưu tiên</b>
                        <SourceType type="mo phong" />
                    </div>
                    <h2 id="choose-heading">Nếu là đại biểu, bạn ưu tiên điều gì?</h2>
                    <p className="panel-lede">
                        Chọn một hướng ưu tiên, rồi mở đối chiếu để xem hướng nào khớp với nội dung
                        Đại hội IX.
                    </p>
                    <aside className="prior-summary" aria-label="Tóm tắt bước 1">
                        <div>
                            <span>01 · ĐỌC TÓM TẮT THEO GIÁO TRÌNH</span>
                            <b>{dossier.summary.text}</b>
                        </div>
                        <small>
                            Nguồn:{' '}
                            {dossier.sources
                                .map((item) => 'tr. ' + item.printedPage)
                                .filter(
                                    (page, sourceIndex, all) => all.indexOf(page) === sourceIndex,
                                )
                                .join(', ')}
                        </small>
                    </aside>
                    <ChoiceList dossier={dossier} choice={choice} onSelect={onChoose} />
                    <div className="step-actions">
                        <span>
                            {choice
                                ? 'Lựa chọn đã ghi nhận. Mở đối chiếu để xem kết quả.'
                                : 'Chọn một hướng để mở phần đối chiếu.'}
                        </span>
                        <div className="step-actions__buttons">
                            <button className="outline-button" onClick={() => onStage('read')}>
                                <ArrowLeft size={15} /> Về bước 1
                            </button>
                            <button
                                className="button-primary"
                                disabled={!choice}
                                onClick={() => onStage('compare')}
                            >
                                Mở đối chiếu <ArrowRight size={17} />
                            </button>
                        </div>
                    </div>
                </section>
            )}
            {stage === 'compare' && (
                <section
                    ref={stepPanelRef}
                    className="step-panel compare-panel"
                    aria-labelledby="compare-heading"
                >
                    <div className="panel-kicker">
                        <span>03</span>
                        <b>Biên bản đối chiếu</b>
                        <SourceType type="dien giai" />
                    </div>
                    <h2 id="compare-heading">Lựa chọn và hướng Đại hội IX</h2>
                    <div className="compare-grid">
                        <article className="compare-card compare-card--learner">
                            <span className="compare-card__label">
                                <span className="compare-card__dot" /> LỰA CHỌN CỦA BẠN
                            </span>
                            <h3>{selected?.title || 'Chưa có lựa chọn'}</h3>
                            <p>{selected?.detail || 'Chưa ghi nhận.'}</p>
                            <span
                                className={
                                    'alignment-badge' +
                                    (selected?.alignment === 'official'
                                        ? ' alignment-badge--official'
                                        : ' alignment-badge--alternative')
                                }
                            >
                                {selected?.alignment === 'official'
                                    ? 'Khớp hướng Đại hội IX'
                                    : 'Khác hướng Đại hội IX'}
                            </span>
                            <SourceType type="mo phong" />
                        </article>
                        <article className="compare-card compare-card--congress">
                            <span className="compare-card__label">
                                <span className="compare-card__dot" /> HƯỚNG ĐẠI HỘI IX
                            </span>
                            <h3>Theo giáo trình</h3>
                            <p>{dossier.congressDirection.text}</p>
                            <SourceType type={dossier.congressDirection.sourceType} />
                        </article>
                    </div>
                    <div className="comparison-note">
                        <Sparkles size={17} />
                        <p>{dossier.comparisonExplanation.text}</p>
                        <SourceType type={dossier.comparisonExplanation.sourceType} />
                    </div>
                    <SourceList sources={dossier.sources} />
                    <div className="step-actions">
                        <span>
                            {isCompleted
                                ? 'Tờ trình đã nằm trong biên bản của bạn.'
                                : 'Xác nhận để ghi lựa chọn vào biên bản thảo luận.'}
                        </span>
                        <div className="step-actions__buttons">
                            <button className="outline-button" onClick={() => onStage('choose')}>
                                <ArrowLeft size={15} /> Sửa lựa chọn
                            </button>
                            <button className="button-primary" onClick={() => onFinish(dossier.id)}>
                                {isCompleted ? 'Tiếp tục hành trình' : 'Ghi vào biên bản'}{' '}
                                <ArrowRight size={17} />
                            </button>
                        </div>
                    </div>
                </section>
            )}
        </main>
    );
}

function KnowledgeMap({ selectedNode, onSelectNode }) {
    const lookup = Object.fromEntries(knowledgeMap.nodes.map((node) => [node.id, node]));
    return (
        <div className="knowledge-map" aria-label="Bản đồ tri thức tương tác">
            <span className="knowledge-map__eyebrow">BẢN ĐỒ TRI THỨC · CHẠM VÀO MỘT KHÁI NIỆM</span>
            <svg viewBox="0 0 1000 540" role="group" aria-label="Mối liên hệ giữa các tờ trình">
                <defs>
                    <filter id="map-glow">
                        <feGaussianBlur stdDeviation="5" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>
                {knowledgeMap.edges.map(([from, to]) => {
                    const a = lookup[from];
                    const b = lookup[to];
                    return (
                        <line
                            key={from + to}
                            className={
                                'map-edge' +
                                (selectedNode === from || selectedNode === to ? ' is-lit' : '')
                            }
                            x1={a.x * 10}
                            y1={a.y * 5.4}
                            x2={b.x * 10}
                            y2={b.y * 5.4}
                        />
                    );
                })}
                {knowledgeMap.nodes.map((node) => {
                    const x = node.x * 10;
                    const y = node.y * 5.4;
                    const align = node.x > 78 ? 'end' : 'start';
                    const labelX = node.x > 78 ? -18 : 18;
                    return (
                        <g
                            key={node.id}
                            className={
                                'map-node' + (selectedNode === node.id ? ' is-selected' : '')
                            }
                            role="button"
                            tabIndex="0"
                            aria-label={node.label}
                            aria-pressed={selectedNode === node.id}
                            onClick={() => onSelectNode(node.id)}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter' || event.key === ' ') {
                                    event.preventDefault();
                                    onSelectNode(node.id);
                                }
                            }}
                        >
                            <circle className="map-node__halo" cx={x} cy={y} r="20" />
                            <circle className="map-node__ring" cx={x} cy={y} r="10" />
                            <circle className="map-node__core" cx={x} cy={y} r="3" />
                            <text x={x + labelX} y={y + 4} textAnchor={align}>
                                {node.label}
                            </text>
                        </g>
                    );
                })}
            </svg>
            <div className="knowledge-map__legend">
                <i /> Kết nối giữa các ý trong phần Đại hội IX <span>·</span>
                <small>Sơ đồ diễn giải, không phải sơ đồ trong giáo trình</small>
            </div>
        </div>
    );
}

function Summary({ choices, completed, onOpenDossier, onHome, onReset }) {
    const [selectedNode, setSelectedNode] = useState('context');
    const selectedMap =
        knowledgeMap.nodes.find((node) => node.id === selectedNode) || knowledgeMap.nodes[0];
    const choiceMap = useMemo(
        () =>
            Object.fromEntries(
                dossiers.map((dossier) => [
                    dossier.id,
                    dossier.choices.find((item) => item.id === choices[dossier.id]),
                ]),
            ),
        [choices],
    );
    const completedChoices = completed.map((id) => choiceMap[id]).filter(Boolean);
    const alignedCount = completedChoices.filter((item) => item.alignment === 'official').length;
    const otherDirectionCount = completedChoices.length - alignedCount;
    return (
        <main className="summary-shell page-shell page-enter" key="summary">
            <div className="summary-hero">
                <div className="summary-hero__copy">
                    <span className="eyebrow eyebrow--dark">KẾT THÚC PHIÊN THẢO LUẬN</span>
                    <h1>
                        Biên bản của
                        <br />
                        <em>một đại biểu.</em>
                    </h1>
                    <p>
                        {completed.length} trên {dossiers.length} tờ trình đã được bạn xử lý. Đây là
                        lựa chọn học tập cá nhân, không phải kết quả biểu quyết thật.
                    </p>
                    <button className="button-primary summary-restart" onClick={onReset}>
                        <RotateCcw size={16} /> Làm lại từ đầu
                    </button>
                </div>
                <div className="summary-seal">
                    <Flag size={27} />
                    <b>{String(completed.length).padStart(2, '0')}</b>
                    <small>ĐÃ ĐỐI CHIẾU</small>
                </div>
            </div>
            <section className="summary-score" aria-label="Tổng hợp lựa chọn đã ghi biên bản">
                <article>
                    <span>ĐÃ GHI BIÊN BẢN</span>
                    <b>
                        {completedChoices.length}
                        <small> / {dossiers.length}</small>
                    </b>
                    <p>tờ trình đã đối chiếu</p>
                </article>
                <article className="summary-score__match">
                    <span>KHỚP HƯỚNG ĐẠI HỘI IX</span>
                    <b>{alignedCount}</b>
                    <p>lựa chọn bám sát định hướng</p>
                </article>
                <article className="summary-score__other">
                    <span>CHỌN HƯỚNG KHÁC</span>
                    <b>{otherDirectionCount}</b>
                    <p>lựa chọn để tiếp tục so sánh</p>
                </article>
            </section>
            <section className="ledger-section">
                <div className="section-heading-row">
                    <div>
                        <span className="eyebrow eyebrow--dark">SO SÁNH HAI HƯỚNG</span>
                        <h2>Biên bản thảo luận</h2>
                        <p>
                            Lựa chọn của bạn nằm cạnh nội dung Đại hội IX được giáo trình ghi nhận.
                            Số liệu chỉ tính các tờ trình đã ghi biên bản.
                        </p>
                        <p className="summary-alignment-count">
                            {alignedCount} lựa chọn khớp hướng Đại hội IX · {otherDirectionCount}{' '}
                            lựa chọn theo hướng khác.
                        </p>
                    </div>
                    <button className="outline-button" onClick={onHome}>
                        <ArrowLeft size={16} /> Về sảnh
                    </button>
                </div>
                <div className="ledger-list">
                    {dossiers.map((dossier) => {
                        const own = choiceMap[dossier.id];
                        const done = completed.includes(dossier.id);
                        return (
                            <article
                                className={'ledger-row theme-' + dossier.theme}
                                key={dossier.id}
                            >
                                <div className="ledger-row__title">
                                    <span>{dossier.number}</span>
                                    <Icon name={dossier.icon} size={19} />
                                    <b>{dossier.shortTitle}</b>
                                </div>
                                <div className="ledger-row__own">
                                    <small>LỰA CHỌN CỦA BẠN</small>
                                    <p>{own ? own.title : 'Chưa ghi nhận'}</p>
                                    {own && (
                                        <span
                                            className={
                                                'alignment-badge' +
                                                (own.alignment === 'official'
                                                    ? ' alignment-badge--official'
                                                    : ' alignment-badge--alternative')
                                            }
                                        >
                                            {own.alignment === 'official'
                                                ? 'Khớp hướng Đại hội IX'
                                                : 'Khác hướng Đại hội IX'}
                                        </span>
                                    )}
                                    <SourceType type={own ? 'mo phong' : 'dien giai'} />
                                </div>
                                <div className="ledger-row__official">
                                    <small>ĐẠI HỘI IX · THEO GIÁO TRÌNH</small>
                                    <p>{dossier.congressDirection.text}</p>
                                    <SourceType type={dossier.congressDirection.sourceType} />
                                </div>
                                <button
                                    className="ledger-row__open"
                                    onClick={() => onOpenDossier(dossier.id)}
                                    aria-label={'Mở tờ trình ' + dossier.title}
                                >
                                    <ArrowUpRight size={17} />
                                </button>
                                {!done && (
                                    <span className="ledger-row__pending">CHƯA HOÀN TẤT</span>
                                )}
                            </article>
                        );
                    })}
                </div>
            </section>
            <section className="map-section">
                <div className="section-heading-row">
                    <div>
                        <span className="eyebrow eyebrow--dark">NỐI CÁC Ý CHÍNH</span>
                        <h2>Bản đồ tri thức</h2>
                        <p>Mỗi điểm mở lại tờ trình. Đường nối là diễn giải để giúp ôn tập.</p>
                    </div>
                    <span className="map-section__selected">
                        <Icon
                            name={dossiers.find((item) => item.id === selectedMap.dossierId)?.icon}
                            size={16}
                        />{' '}
                        {selectedMap.label}
                    </span>
                </div>
                <KnowledgeMap selectedNode={selectedNode} onSelectNode={setSelectedNode} />
                <div className="map-detail">
                    <div>
                        <small>KHÁI NIỆM ĐANG SÁNG</small>
                        <b>{selectedMap.label}</b>
                        <SourceType type={selectedMap.sourceType} />
                    </div>
                    <button
                        className="text-button"
                        onClick={() => onOpenDossier(selectedMap.dossierId)}
                    >
                        Mở tờ trình <ArrowRight size={15} />
                    </button>
                </div>
            </section>
            <AfterCongressPanel />
            <section className="review-section">
                <span className="eyebrow eyebrow--dark">TỰ ÔN TẬP · CÂU HỎI MỞ</span>
                <h2>Đem gì ra khỏi phòng họp?</h2>
                <div className="review-grid">
                    {reviewQuestions.map((item, index) => (
                        <article key={item.id} className="review-card">
                            <span>0{index + 1}</span>
                            <p>{item.question}</p>
                            <SourceType type={item.sourceType} />
                        </article>
                    ))}
                </div>
            </section>
            <div className="summary-footer">
                <GraduationCap size={20} />
                <p>
                    Hãy mở thẻ nguồn để kiểm tra lại trang in, rồi tự viết câu trả lời bằng lập luận
                    của mình.
                </p>
                <button onClick={onHome}>
                    Về sảnh <ArrowUpRight size={14} />
                </button>
            </div>
        </main>
    );
}

function ChatDrawer({ open, onClose, pendingQuestion }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [retryQuestion, setRetryQuestion] = useState('');
    const feedRef = useRef(null);

    useEffect(() => {
        if (open) document.getElementById('chat-input')?.focus();
    }, [open]);
    useEffect(() => {
        const feed = feedRef.current;
        if (feed) feed.scrollTo({ top: feed.scrollHeight, behavior: 'smooth' });
    }, [messages, busy, error]);
    useEffect(() => {
        if (pendingQuestion) {
            setInput(pendingQuestion);
            document.getElementById('chat-input')?.focus();
        }
    }, [pendingQuestion]);

    async function submitQuestion(question = input, { retry = false } = {}) {
        const value = question.trim();
        if (!value || busy) return;
        const recentMessages = messages.slice(-12);
        const historyMessages =
            retry && recentMessages.at(-1)?.role === 'user' && recentMessages.at(-1)?.text === value
                ? recentMessages.slice(0, -1)
                : recentMessages;
        const history = historyMessages.map((message) => ({
            role: message.role,
            text: message.text,
        }));
        if (!retry) setMessages((current) => [...current, { role: 'user', text: value }]);
        setRetryQuestion(value);
        setInput('');
        setBusy(true);
        setError('');
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: value, history }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Chưa gửi được câu hỏi.');
            setMessages((current) => [
                ...current,
                {
                    role: 'assistant',
                    text: data.answer,
                    sources: data.sources || [],
                    suggestions: data.suggestions || [],
                    grounded: data.grounded,
                    provider: data.provider,
                    model: data.model,
                    aiStatus: data.aiStatus,
                },
            ]);
        } catch (cause) {
            setError(cause.message || 'Không kết nối được máy chủ hỏi đáp.');
        } finally {
            setBusy(false);
        }
    }

    if (!open) return null;
    return (
        <div className="chat-layer" role="presentation">
            <button className="chat-scrim" onClick={onClose} aria-label="Đóng khung hỏi đáp" />
            <section
                className="chat-drawer"
                role="dialog"
                aria-modal="true"
                aria-labelledby="chat-title"
            >
                <header className="chat-header">
                    <span className="chat-header__icon">
                        <MessageCircle size={20} />
                    </span>
                    <div>
                        <small>HỎI ĐÁP LINH HOẠT · CÓ NGUỒN KHI TRA CỨU</small>
                        <h2 id="chat-title">Hỏi Agent</h2>
                    </div>
                    <button className="icon-button" onClick={onClose} aria-label="Đóng">
                        <X size={19} />
                    </button>
                </header>
                <div className="chat-scope">
                    <BookOpen size={16} />
                    <p>
                        <b>{textbook.printedTitle}</b>
                        <small>{textbook.file}</small>
                    </p>
                </div>
                <div className="chat-rule">
                    <Sparkles size={15} />
                    <span>
                        Hỏi tự nhiên về mọi nội dung; câu trả lời dựa trên giáo trình sẽ kèm nguồn
                    </span>
                </div>
                <div className="chat-feed" ref={feedRef} aria-live="polite">
                    {messages.map((message, index) => {
                        const visibleSources = (message.sources || []).slice(0, 2);
                        const additionalSources = (message.sources || []).slice(2);
                        const visibleSuggestions = (message.suggestions || []).filter(
                            (suggestion) => !/\btóm tắt chương\s*[123]\b/i.test(suggestion),
                        );
                        const providerBadge = {
                            className: 'chat-provider-badge--gemini',
                            label: `GEMINI · ${message.model || 'AI'}`,
                        };
                        const renderSource = (sourceItem, sourceIndex) => (
                            <div className="chat-source" key={sourceItem.id || sourceIndex}>
                                <span>
                                    {sourceItem.chapter || sourceItem.section || 'Giáo trình'}
                                    {sourceItem.page ? ' · trang ' + sourceItem.page : ''}
                                </span>
                            </div>
                        );
                        return (
                            <article
                                className={'chat-message chat-message--' + message.role}
                                key={index}
                            >
                                <div className="chat-bubble">
                                    <p>{message.text}</p>
                                    {message.role === 'assistant' && (
                                        <span
                                            className={
                                                'chat-provider-badge ' + providerBadge.className
                                            }
                                        >
                                            <Sparkles size={12} />
                                            {providerBadge.label}
                                        </span>
                                    )}
                                </div>
                                {visibleSources.length > 0 && (
                                    <div className="chat-sources">
                                        <b>
                                            <BookOpen size={13} /> Nguồn trong giáo trình
                                        </b>
                                        {visibleSources.map(renderSource)}
                                        {additionalSources.length > 0 && (
                                            <details className="chat-source-more">
                                                <summary>
                                                    Xem thêm {additionalSources.length} tham chiếu
                                                </summary>
                                                {additionalSources.map(renderSource)}
                                            </details>
                                        )}
                                    </div>
                                )}
                                {message.role === 'assistant' && visibleSuggestions.length > 0 && (
                                    <div className="chat-next">
                                        <small>CÂU HỎI TIẾP THEO</small>
                                        {visibleSuggestions.map((suggestion) => (
                                            <button
                                                key={suggestion}
                                                onClick={() => submitQuestion(suggestion)}
                                                disabled={busy}
                                            >
                                                {suggestion}
                                                <ArrowUpRight size={13} />
                                            </button>
                                        ))}
                                    </div>
                                )}
                                {message.role === 'assistant' && message.grounded === false && (
                                    <span className="chat-not-found">
                                        Chưa tìm thấy đoạn phù hợp trong giáo trình.
                                    </span>
                                )}
                            </article>
                        );
                    })}
                    {messages.length === 0 && (
                        <div className="starter-list">
                            <small>GỢI Ý CÂU HỎI</small>
                            {chatSuggestions.slice(0, 4).map((suggestion) => (
                                <button
                                    key={suggestion}
                                    onClick={() => submitQuestion(suggestion)}
                                    disabled={busy}
                                >
                                    {suggestion}
                                    <ArrowUpRight size={13} />
                                </button>
                            ))}
                        </div>
                    )}
                    {busy && (
                        <div className="chat-loading" aria-label="Đang gửi câu hỏi tới Gemini">
                            <i />
                            <i />
                            <i />
                            <span>Đang phản hồi…</span>
                        </div>
                    )}
                    {error && (
                        <p className="chat-error" role="alert">
                            {error}{' '}
                            <button onClick={() => submitQuestion(retryQuestion, { retry: true })}>
                                Thử lại
                            </button>
                        </p>
                    )}
                </div>
                <form
                    className="chat-composer"
                    onSubmit={(event) => {
                        event.preventDefault();
                        submitQuestion();
                    }}
                >
                    <label className="sr-only" htmlFor="chat-input">
                        Câu hỏi cho Agent
                    </label>
                    <textarea
                        id="chat-input"
                        value={input}
                        onChange={(event) => setInput(event.target.value)}
                        placeholder="Hỏi về bất kỳ nội dung nào trong giáo trình…"
                        rows="2"
                        onKeyDown={(event) => {
                            if (event.key === 'Enter' && !event.shiftKey) {
                                event.preventDefault();
                                submitQuestion();
                            }
                        }}
                    />
                    <button type="submit" disabled={!input.trim() || busy} aria-label="Gửi câu hỏi">
                        <Send size={17} />
                    </button>
                </form>
                <p className="chat-footer">
                    Khi trả lời dựa trên giáo trình, Agent sẽ ghi chương và trang để bạn đối chiếu.
                </p>
            </section>
        </div>
    );
}

export default function App() {
    const [screen, setScreen] = useState('hall');
    const [activeId, setActiveId] = useState(dossiers[0].id);
    const [stage, setStage] = useState('read');
    const [choices, setChoices] = useState(() => readSaved(storageKeys.choices, {}));
    const [completed, setCompleted] = useState(() => readSaved(storageKeys.completed, []));
    const [chatOpen, setChatOpen] = useState(false);
    const [pendingQuestion, setPendingQuestion] = useState('');
    const [health, setHealth] = useState(null);
    const activeIndex = dossiers.findIndex((item) => item.id === activeId);
    const activeDossier = dossiers[activeIndex] || dossiers[0];
    const nextDossier = dossiers.find((item) => !completed.includes(item.id)) || dossiers[0];

    useEffect(() => {
        try {
            window.localStorage.setItem(storageKeys.choices, JSON.stringify(choices));
        } catch {
            /* storage is optional */
        }
    }, [choices]);
    useEffect(() => {
        try {
            window.localStorage.setItem(storageKeys.completed, JSON.stringify(completed));
        } catch {
            /* storage is optional */
        }
    }, [completed]);
    useEffect(() => {
        fetch('/api/health')
            .then((response) => (response.ok ? response.json() : null))
            .then(setHealth)
            .catch(() => setHealth(null));
    }, []);

    function openDossier(id) {
        setActiveId(id);
        setStage(completed.includes(id) ? 'compare' : 'read');
        setScreen('dossier');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    function goToStage(nextStage) {
        setStage(nextStage);
    }
    function finishDossier(id) {
        setCompleted((current) => (current.includes(id) ? current : [...current, id]));
        const next = dossiers.find((item) => !completed.includes(item.id) && item.id !== id);
        if (next) {
            setActiveId(next.id);
            setStage('read');
            setScreen('dossier');
        } else setScreen('summary');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    function restartSession() {
        const confirmed = window.confirm(
            'Làm lại từ đầu? Tiến độ và các lựa chọn đã lưu trên trình duyệt sẽ bị xóa.',
        );
        if (!confirmed) return;
        try {
            Object.values(storageKeys).forEach((key) => window.localStorage.removeItem(key));
        } catch {
            window.alert(
                'Không thể xóa tiến độ đã lưu. Hãy kiểm tra quyền lưu trữ của trình duyệt rồi thử lại.',
            );
            return;
        }
        window.location.reload();
    }
    function askQuestion(question = '') {
        setPendingQuestion(question);
        setChatOpen(true);
    }
    useEffect(() => {
        if (pendingQuestion && chatOpen) {
            const timer = window.setTimeout(() => setPendingQuestion(''), 0);
            return () => window.clearTimeout(timer);
        }
    }, [pendingQuestion, chatOpen]);

    return (
        <div className="app-frame">
            <Header
                screen={screen}
                progress={completed.length}
                onHome={() => {
                    setScreen('hall');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onSummary={() => {
                    setScreen('summary');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onOpenChat={() => askQuestion()}
            />
            {screen === 'hall' && (
                <Hall
                    completed={completed}
                    selectedId={activeId}
                    onOpenDossier={openDossier}
                    onStart={() => openDossier(nextDossier.id)}
                    onSummary={() => setScreen('summary')}
                    onAsk={askQuestion}
                />
            )}
            {screen === 'dossier' && (
                <DossierRoom
                    dossier={activeDossier}
                    stage={stage}
                    choice={choices[activeDossier.id]}
                    onChoose={(choiceId) =>
                        setChoices((current) => ({ ...current, [activeDossier.id]: choiceId }))
                    }
                    onStage={goToStage}
                    onBack={() => setScreen('hall')}
                    onFinish={finishDossier}
                    isCompleted={completed.includes(activeDossier.id)}
                    index={activeIndex}
                />
            )}
            {screen === 'summary' && (
                <Summary
                    choices={choices}
                    completed={completed}
                    onOpenDossier={openDossier}
                    onHome={() => setScreen('hall')}
                    onReset={restartSession}
                />
            )}
            <footer className="site-footer">
                <span className="footer-brand">
                    <Icon name="Landmark" size={18} /> PHÒNG HỌP ĐẠI BIỂU ĐẠI HỘI IX
                </span>
                <span>
                    {health?.indexedPassages
                        ? health.indexedPassages + ' đoạn giáo trình đã lập chỉ mục'
                        : 'Học tập dựa trên giáo trình có dẫn nguồn'}
                </span>
                <button
                    onClick={() =>
                        askQuestion('Tóm tắt chương 1, chương 2 và chương 3 trong giáo trình.')
                    }
                >
                    Hỏi Agent về toàn giáo trình <ArrowUpRight size={14} />
                </button>
            </footer>
            <button
                className={'floating-chat' + (chatOpen ? ' is-open' : '')}
                onClick={() => setChatOpen(!chatOpen)}
                aria-label={chatOpen ? 'Đóng Hỏi Agent' : 'Mở Hỏi Agent'}
            >
                <span className="floating-chat__pulse" />
                <MessageCircle size={20} />
                <b>HỎI AGENT</b>
            </button>
            <ChatDrawer
                open={chatOpen}
                onClose={() => setChatOpen(false)}
                pendingQuestion={pendingQuestion}
            />
        </div>
    );
}
