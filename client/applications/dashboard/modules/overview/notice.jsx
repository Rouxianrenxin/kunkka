const React = require('react');
const getTime = require('client/utils/time_unification');

class NoticeContanier extends React.Component {
  constructor(props) {
    super(props);

    const latestNoticeId = props.list[0].id;
    const userId = props.HALO.user.userId;
    let storageObj = window.localStorage.getItem('noticeInfo');
    let hadRead;
    let noticeInfo;

    try {
      noticeInfo = JSON.parse(storageObj) || {};
    } catch (e) {
      noticeInfo = {};
    }


    if (noticeInfo[userId]) {
      if (noticeInfo[userId].latestNoticeId === latestNoticeId) {
        // 最新公告 ID 相同的情况，说明两次登录之间没有新的公告生成
        hadRead = noticeInfo[userId].hadRead;
      } else {
        // 有新的公告生成
        hadRead = false;
        noticeInfo[userId].latestNoticeId = latestNoticeId;
        noticeInfo[userId].hadRead = hadRead;
        window.localStorage.setItem('noticeInfo', JSON.stringify(noticeInfo));
      }
    } else {
      // 当前用户在 localStorage 中还没有对应存储内容
      hadRead = false;
      noticeInfo[userId] = {
        latestNoticeId: latestNoticeId,
        hadRead: hadRead
      };
      window.localStorage.setItem('noticeInfo', JSON.stringify(noticeInfo));
    }


    this.state = {
      hadReadLatest: hadRead
    };

    this.onReadLatest = this.onReadLatest.bind(this);
  }

  onReadLatest() {
    this.updateStorage(this.props.list[0].id);
    this.setState({
      hadReadLatest: true
    });
  }

  updateStorage(noticeId) {
    let userId = this.props.HALO.user.userId;
    let storageObj = window.localStorage.getItem('noticeInfo');
    let noticeInfo = JSON.parse(storageObj);
    noticeInfo[userId].hadRead = true;
    window.localStorage.setItem('noticeInfo', JSON.stringify(noticeInfo));
  }

  render() {
    const __ = this.props.__;
    const hadReadLatest = this.state.hadReadLatest;
    const latestNotice = this.props.list[0];
    return (
      <div className="notice-container">
        {
          !hadReadLatest &&
            <div className="new-notice">
              <i className="glyphicon icon-status-warning"></i>
              <span>{latestNotice.title}</span>
              <i className="glyphicon icon-close" onClick={this.onReadLatest}></i>
              <a href={latestNotice.link} target="_blank" onClick={this.onReadLatest}>{__.see_details}</a>
            </div>
        }
        <NoticeList list={this.props.list} hadReadLatest={hadReadLatest} __={__} HALO={this.props.HALO}/>
      </div>
    );
  }
}

function NoticeList({ list, hadReadLatest, __, HALO }) {
  let notices = hadReadLatest ? list : list.slice(1);
  notices = notices.slice(0, 2);
  return (
    notices &&
    <div className="notice-list-content-container">
      <div>
        <span>{__.notice}</span>
        <a href={HALO.settings.more_notice_link} target="_blank">{__.more}</a>
      </div>
      <ul>
        { notices.map(notice => {
          return (
            <li key={notice.id}>
              <a href={notice.link} target="_blank">{notice.title}</a>
              <span>{ getTime(notice.createdAt) }</span>
            </li>
          );
        }) }
      </ul>
    </div>
  );
}

module.exports = NoticeContanier;
