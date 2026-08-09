import { GAME_IMAGES } from '../data/tasks';
import type { UserProfile } from '../types/game';

interface RewardCaseProps {
  profile: UserProfile;
  onClose: () => void;
}

export function RewardCase({ profile, onClose }: RewardCaseProps) {
  return (
    <main className="reward-screen" style={{ backgroundImage: `linear-gradient(rgba(8,35,54,.18), rgba(8,35,54,.64)), url(${GAME_IMAGES.hero})` }}>
      <section className="reward-certificate">
        <span className="reward-crown">🏆</span>
        <p className="panel-kicker">Три волшебные марки собраны</p>
        <h1>Past Simple Traveller</h1>
        <div className="certificate-name">{profile.avatar} {profile.name}</div>
        <p>I played. I watched. I visited.<br /><strong>I finished London Yesterday Quest!</strong></p>
        <div className="stamp-row large"><span>🚌</span><span>🌷</span><span>🚂</span></div>
        <div className="reward-actions">
          <button className="button button-primary" type="button" onClick={() => window.print()}>РАСПЕЧАТАТЬ</button>
          <button className="button button-soft" type="button" onClick={onClose}>К ИГРАМ</button>
        </div>
      </section>
    </main>
  );
}
