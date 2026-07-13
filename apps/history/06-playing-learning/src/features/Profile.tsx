import { useState } from "react";
import { WorkspaceHeader } from "../components/WorkspaceHeader";
import type { LearningFocus } from "../content/catalog";
import type { GenreGoal, LearnerProfile, PracticeMode } from "../learning/types";
import type { FeatureProps } from "./types";

const GENRES: GenreGoal[] = ["pop", "rock", "blues", "jazz", "songwriting", "freestyle"];
const FOCUSES: LearningFocus[] = ["fretboard", "intervals", "harmony", "progressions", "ear", "improvisation"];
const MODES: PracticeMode[] = ["knowledge", "ear", "fretboard", "harmony", "play-along"];

function toggle<T>(items: T[], value: T): T[] {
  return items.includes(value) ? items.filter((item) => item !== value) : [...items, value];
}

export function Profile({ state, dispatch }: FeatureProps) {
  const [profile, setProfile] = useState<LearnerProfile>(state.profile);
  const save = () => dispatch({ type: "updateProfile", profile });
  return (
    <div className="workspace-stack">
      <WorkspaceHeader
        eyebrow="Learning profile"
        title="Tell the system what usable musicianship means to you."
        description="Your genres, goals, experience, and available time shape lesson recommendations and future practice scheduling."
      />
      <section className="profile-grid">
        <div className="panel profile-section">
          <div className="section-label">Experience</div>
          <h2>Where are you starting?</h2>
          <div className="choice-row">
            {(["new", "some", "confident"] as const).map((experience) => (
              <button className={profile.experience === experience ? "is-active" : ""} onClick={() => setProfile({ ...profile, experience })} key={experience}>{experience}</button>
            ))}
          </div>
        </div>
        <div className="panel profile-section">
          <div className="section-label">Practice time</div>
          <h2>Choose a sustainable session.</h2>
          <input type="range" min="5" max="60" step="5" value={profile.dailyMinutes} onChange={(event) => setProfile({ ...profile, dailyMinutes: Number(event.target.value) })} />
          <strong>{profile.dailyMinutes} minutes per day</strong>
        </div>
        <div className="panel profile-section wide">
          <div className="section-label">Musical destinations</div>
          <h2>What do you want to play?</h2>
          <div className="choice-row wrap">
            {GENRES.map((genre) => (
              <button className={profile.genres.includes(genre) ? "is-active" : ""} onClick={() => setProfile({ ...profile, genres: toggle(profile.genres, genre) })} key={genre}>{genre}</button>
            ))}
          </div>
        </div>
        <div className="panel profile-section wide">
          <div className="section-label">Learning priorities</div>
          <h2>What should improve first?</h2>
          <div className="choice-row wrap">
            {FOCUSES.map((focus) => (
              <button className={profile.focuses.includes(focus) ? "is-active" : ""} onClick={() => setProfile({ ...profile, focuses: toggle(profile.focuses, focus) })} key={focus}>{focus}</button>
            ))}
          </div>
        </div>
        <div className="panel profile-section wide">
          <div className="section-label">Default session</div>
          <h2>How do you prefer to begin?</h2>
          <div className="choice-row wrap">
            {MODES.map((mode) => (
              <button className={profile.practiceMode === mode ? "is-active" : ""} onClick={() => setProfile({ ...profile, practiceMode: mode })} key={mode}>{mode.replace("-", " ")}</button>
            ))}
          </div>
        </div>
      </section>
      <button className="button primary save-profile" onClick={save}>Save learning profile</button>
    </div>
  );
}
