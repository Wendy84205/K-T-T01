#!/bin/bash
echo "🔄 Thiết lập Git branches cho CyberSecure Enterprise Platform..."

# Kiểm tra git
if [ ! -d ".git" ]; then
    echo "❌ Không phải git repository!"
    exit 1
fi

REMOTE=$(git remote)

# Danh sách branch
MAIN="main"
DEV="develop"

# Branch tính năng theo lộ trình 3,5 tháng
FEATURES=(
    "feat/auth-module"
    "feat/user-rbac"
    "feat/chat-api"
    "feat/file-api"
    "feat/db-schema"
    "feat/ui-setup"
    "feat/dashboard-ui"
    "feat/chat-ui"
    "feat/file-ui"
    "feat/logging-system"
    "feat/chat-security"
    "feat/file-integrity"
    "feat/security-plan"
)

# Tạo develop nếu chưa có
if ! git show-ref --verify --quiet refs/heads/$DEV; then
    echo "📦 Tạo branch '$DEV'..."
    git checkout $MAIN
    git checkout -b $DEV
    git push -u $REMOTE $DEV
fi

# Tạo feature branches
echo "🛠️ Tạo feature branches..."
for branch in "${FEATURES[@]}"; do
    if ! git show-ref --verify --quiet refs/heads/$branch; then
        git checkout $DEV
        git checkout -b $branch
        echo "  ✅ $branch"
        git checkout $DEV
    fi
done

# Tạo release branch
git checkout -b release/v1.0 $DEV 2>/dev/null && echo "🚀 release/v1.0" || echo "⚠️  release/v1.0 đã tồn tại"

# Tạo hotfix branch
git checkout $MAIN
git checkout -b hotfix/critical 2>/dev/null && echo "🔧 hotfix/critical" || echo "⚠️  hotfix/critical đã tồn tại"

# Trở lại develop
git checkout $DEV

echo "🎉 Hoàn tất! Các branch đã sẵn sàng."
echo ""
echo "📋 Danh sách branch:"
git branch
